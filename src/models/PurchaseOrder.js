const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
    // ORDER INFO
    poNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'partial', 'received', 'cancelled'],
        default: 'draft'
    },

    // SUPPLIER
    supplierName: { type: String, required: true },
    supplierContact: { type: String, default: '' },
    supplierEmail: { type: String, default: '' },

    // ORDER ITEMS
    items: [{
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicineName: { type: String, required: true },
        batchNumber: { type: String },
        quantity: { type: Number, required: true },
        receivedQuantity: { type: Number, default: 0 },
        purchasePrice: { type: Number, required: true },
        totalPrice: { type: Number },
        expiryDate: { type: Date },
        manufacturingDate: { type: Date }
    }],

    // FINANCIALS
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // DATES
    orderedAt: { type: Date, default: Date.now },
    expectedDelivery: { type: Date, default: null },
    receivedAt: { type: Date, default: null },

    // METADATA
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' }
}, {
    timestamps: true
});

// Pre-save hook for poNumber generation and financial calculations
PurchaseOrderSchema.pre('save', async function (next) {
    // 1. Calculate item totals and overall totals
    let subtotal = 0;
    this.items.forEach(item => {
        item.totalPrice = item.quantity * item.purchasePrice;
        subtotal += item.totalPrice;
    });
    this.subtotal = subtotal;
    this.totalAmount = subtotal; // Assuming no extra taxes/discounts for now as per prompt

    // 2. Auto-generate poNumber if not exists
    if (!this.poNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('PurchaseOrder').countDocuments({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        const paddedCount = String(count + 1).padStart(4, '0');
        this.poNumber = `PO-${year}-${paddedCount}`;
    }

    next();
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
