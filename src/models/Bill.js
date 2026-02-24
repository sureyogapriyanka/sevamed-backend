const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['consultation', 'medicine', 'lab_test', 'procedure', 'room', 'other'],
        default: 'other'
    },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });

const BillSchema = new mongoose.Schema({
    // ── Patient & Appointment ─────────────────────────────────────────────────
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },

    // ── Items ─────────────────────────────────────────────────────────────────
    items: { type: [BillItemSchema], default: [] },

    // ── Financials ────────────────────────────────────────────────────────────
    subtotal: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // ── Payment ───────────────────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['draft', 'pending', 'paid', 'partially_paid', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'insurance', 'online', null],
        default: null
    },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
    upiTransactionId: { type: String, default: '' },

    // ── Insurance ─────────────────────────────────────────────────────────────
    insuranceProvider: { type: String, default: '' },
    insurancePolicyNumber: { type: String, default: '' },
    insuranceCoverage: { type: Number, default: 0 },

    // ── Metadata ──────────────────────────────────────────────────────────────
    billNumber: { type: String, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' }

}, { timestamps: true });

// ── Auto-generate billNumber before saving ────────────────────────────────────
BillSchema.pre('save', async function (next) {
    if (this.billNumber) return next();
    try {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Bill').countDocuments();
        const seq = String(count + 1).padStart(4, '0');
        this.billNumber = `BILL-${year}-${seq}`;
        next();
    } catch (err) {
        next(err);
    }
});

// ── Indexes ───────────────────────────────────────────────────────────────────
BillSchema.index({ patientId: 1 });
BillSchema.index({ status: 1 });
BillSchema.index({ createdAt: -1 });
BillSchema.index({ billNumber: 1 });

module.exports = mongoose.model('Bill', BillSchema);
