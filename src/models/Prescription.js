const mongoose = require('mongoose');

// ─── Medicine Sub-Schema ───────────────────────────────────────────────────────

const MedicineSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        timing: {
            type: String,
            enum: ['before_meal', 'after_meal', 'with_meal', 'empty_stomach', 'bedtime'],
            default: 'after_meal',
        },
        instructions: { type: String, default: '' },
    },
    { _id: false }
);

// ─── Prescription Schema ───────────────────────────────────────────────────────

const PrescriptionSchema = new mongoose.Schema(
    {
        // ── References ──────────────────────────────────────────────────────────────
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null,
        },

        // ── Patient Info (stored for PDF) ────────────────────────────────────────────
        patientName: { type: String, required: true },
        patientAge: { type: Number },
        patientGender: { type: String },
        patientBloodGroup: { type: String },

        // ── Doctor Info (stored for PDF) ─────────────────────────────────────────────
        doctorName: { type: String, required: true },
        doctorSpecialization: { type: String },
        doctorPhone: { type: String },

        // ── Diagnosis ────────────────────────────────────────────────────────────────
        chiefComplaint: { type: String, required: true },
        diagnosis: { type: String, required: true },
        notes: { type: String, default: '' },

        // ── Medicines ────────────────────────────────────────────────────────────────
        medicines: { type: [MedicineSchema], default: [] },

        // ── Additional ───────────────────────────────────────────────────────────────
        labTests: { type: [String], default: [] },
        followUpDate: { type: Date, default: null },
        followUpNotes: { type: String, default: '' },

        // ── Metadata ─────────────────────────────────────────────────────────────────
        prescriptionNumber: { type: String, unique: true, sparse: true },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        issuedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
PrescriptionSchema.index({ patientId: 1 });
PrescriptionSchema.index({ doctorId: 1 });
PrescriptionSchema.index({ appointmentId: 1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ issuedAt: -1 });

// ─── Pre-save Hook: auto-generate prescriptionNumber ─────────────────────────
PrescriptionSchema.pre('save', async function (next) {
    if (this.prescriptionNumber) return next();
    try {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Prescription').countDocuments();
        const seq = String(count + 1).padStart(4, '0');
        this.prescriptionNumber = `RX-${year}-${seq}`;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
