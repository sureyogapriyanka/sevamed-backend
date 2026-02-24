const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        default: null
    },
    patientName: {
        type: String,
        default: ''
    },
    admittedAt: {
        type: Date,
        default: null
    },
    assignedNurse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedNurseName: {
        type: String,
        default: ''
    }
});

const WardSchema = new mongoose.Schema({
    wardName: {
        type: String,
        required: true
    },
    wardCode: {
        type: String,
        unique: true,
        required: true
    },
    floor: {
        type: String,
        default: ''
    },
    totalBeds: {
        type: Number,
        required: true
    },
    availableBeds: {
        type: Number,
        required: true
    },
    beds: [BedSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// PRE-SAVE HOOK to auto-calculate available beds
WardSchema.pre('save', function (next) {
    if (this.beds && this.beds.length > 0) {
        this.availableBeds = this.beds.filter(bed => bed.status === 'available').length;
    }
    next();
});

module.exports = mongoose.model('Ward', WardSchema);
