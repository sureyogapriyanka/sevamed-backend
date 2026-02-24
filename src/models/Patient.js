const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalHistory: {
    type: mongoose.Schema.Types.Mixed
  },
  allergies: [{
    type: String
  }],
  medications: {
    type: mongoose.Schema.Types.Mixed
  },
  emergencyContact: {
    type: mongoose.Schema.Types.Mixed
  },
  bloodType: {
    type: String
  },
  height: {
    type: Number // in cm
  },
  weight: {
    type: Number // in kg
  },
  bmi: {
    type: String
  },
  lastVisit: {
    type: Date
  },

  // ── Indian ID Fields ────────────────────────────────────────────────────────
  aadhaarNumber: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        return v === '' || /^\d{12}$/.test(v);
      },
      message: 'Aadhaar number must be exactly 12 digits'
    }
  },
  aadhaarMasked: { type: String, default: '' },
  abhaId: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        return v === '' || /^\d{14}$/.test(v);
      },
      message: 'ABHA ID must be 14 digits'
    }
  },
  mobileNumber: { type: String, default: '' },
  mobileVerified: { type: Boolean, default: false },
  mobileOtp: { type: String, default: null },
  mobileOtpExpiry: { type: Date, default: null },

  // ── Insurance Fields ────────────────────────────────────────────────────────
  insuranceProvider: { type: String, default: '' },
  insurancePolicyNumber: { type: String, default: '' },
  insuranceValidTill: { type: Date, default: null },
  isAyushmanBeneficiary: { type: Boolean, default: false },
  ayushmanCardNumber: { type: String, default: '' },
  insuranceCoverageAmount: { type: Number, default: 0 },

  // ── Location Fields ─────────────────────────────────────────────────────────
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  pincode: {
    type: String,
    validate: {
      validator: function (v) {
        return v === '' || /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    },
    default: ''
  },
  city: { type: String, default: '' }
}, {
  timestamps: true
});

// Pre-save hook for Aadhaar masking
patientSchema.pre('save', function (next) {
  if (this.isModified('aadhaarNumber') && this.aadhaarNumber) {
    this.aadhaarMasked = `XXXX-XXXX-${this.aadhaarNumber.slice(-4)}`;
  }
  next();
});

// Indexes for better query performance
patientSchema.index({ userId: 1 });

module.exports = mongoose.model('Patient', patientSchema);