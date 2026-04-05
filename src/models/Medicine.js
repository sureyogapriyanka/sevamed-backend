const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    // BASIC INFO
    name: { type: String, required: true, trim: true },
    genericName: { type: String, default: '' },
    brand: { type: String, default: '' },
    category: {
        type: String,
        enum: ['tablet', 'capsule', 'syrup', 'injection',
            'drops', 'cream', 'ointment', 'powder',
            'inhaler', 'suppository', 'other'],
        required: true
    },
    description: { type: String, default: '' },
    symptoms: { type: [String], default: [] },
    sideEffects: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },

    // BARCODE & IDENTIFICATION
    barcode: { type: String, unique: true, sparse: true, default: '' },
    batchNumber: { type: String, default: '' },
    hsnCode: { type: String, default: '' },

    // STOCK INFO
    currentStock: { type: Number, required: true, default: 0 },
    minimumStock: { type: Number, default: 10 },
    maximumStock: { type: Number, default: 1000 },
    unit: {
        type: String,
        enum: ['strip', 'bottle', 'vial', 'tube',
            'box', 'sachet', 'piece', 'ml', 'mg'],
        default: 'strip'
    },
    stockStatus: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock', 'expired'],
        default: 'in_stock'
    },

    // PRICING (INR)
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    gstPercent: { type: Number, default: 12 },

    // EXPIRY & DATES
    manufacturingDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true },
    expiryStatus: {
        type: String,
        enum: ['valid', 'expiring_soon', 'expired'],
        default: 'valid'
    },

    // SUPPLIER INFO
    supplier: {
        name: { type: String, default: '' },
        contactNumber: { type: String, default: '' },
        email: { type: String, default: '' },
        address: { type: String, default: '' }
    },

    // LOCATION
    rackNumber: { type: String, default: '' },
    shelfNumber: { type: String, default: '' },

    // METADATA
    isActive: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastRestockedAt: { type: Date, default: null },
    lastRestockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
    timestamps: true
});

// Pre-save hook for status calculations
MedicineSchema.pre('save', function (next) {
    const today = new Date();
    const expiryDate = new Date(this.expiryDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. Calculate expiryStatus
    if (diffTime < 0) {
        this.expiryStatus = 'expired';
    } else if (diffDays <= 90) {
        this.expiryStatus = 'expiring_soon';
    } else {
        this.expiryStatus = 'valid';
    }

    // 2. Calculate stockStatus
    if (this.expiryStatus === 'expired') {
        this.stockStatus = 'expired';
    } else if (this.currentStock <= 0) {
        this.stockStatus = 'out_of_stock';
    } else if (this.currentStock <= this.minimumStock) {
        this.stockStatus = 'low_stock';
    } else {
        this.stockStatus = 'in_stock';
    }

    next();
});

module.exports = mongoose.model('Medicine', MedicineSchema);
