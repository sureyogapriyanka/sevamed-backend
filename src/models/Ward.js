const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
    bedNumber: { type: String, required: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    patientName: { type: String, default: '' },
    admittedAt: { type: Date, default: null },
    assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedNurseName: { type: String, default: '' },
    admissionNotes: { type: String, default: '' },
    diagnosisOnAdmission: { type: String, default: '' },
    maintenanceReason: { type: String, default: '' }
});

const DischargeLogSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patientName: { type: String, default: '' },
    bedNumber: { type: String },
    admittedAt: { type: Date },
    dischargedAt: { type: Date, default: Date.now },
    dischargeNotes: { type: String, default: '' },
    dischargeReason: { type: String, default: 'recovered' },
    nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nurseName: { type: String, default: '' }
});

const WardSchema = new mongoose.Schema({
    wardName: { type: String, required: true },
    wardCode: { type: String, unique: true, required: true },
    floor: { type: String, default: '1' },
    totalBeds: { type: Number, required: true },
    availableBeds: { type: Number, required: true },
    wardType: {
        type: String,
        enum: ['general', 'icu', 'pediatric', 'maternity', 'surgical', 'orthopedic', 'cardiology', 'neurology', 'oncology', 'isolation'],
        default: 'general'
    },
    nurseInCharge: { type: String, default: '' },
    notes: { type: String, default: '' },
    beds: [BedSchema],
    dischargeLog: [DischargeLogSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// PRE-SAVE HOOK to auto-calculate available beds
WardSchema.pre('save', function (next) {
    if (this.beds && this.beds.length > 0) {
        this.availableBeds = this.beds.filter(bed => bed.status === 'available').length;
        this.totalBeds = this.beds.length;
    }
    next();
});

module.exports = mongoose.model('Ward', WardSchema);
