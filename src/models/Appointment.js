const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: [
      'booked',        // Patient booked online
      'checked_in',    // Reception checked in + OPD fee collected
      'vitals_done',   // Nurse recorded vitals
      'consulting',    // Doctor currently seeing patient
      'consulted',     // Doctor done, prescription written
      'billing',       // Reception generating final bill
      'completed',     // Full payment collected
      'dispensed',     // Pharmacist gave medicines
      'cancelled',     // Cancelled
      'no_show'        // Patient didn't come
    ],
    default: 'booked'
  },
  priority: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'critical', 'emergency'],
    default: 'normal'
  },
  symptoms: {
    type: String
  },
  diagnosis: {
    type: String
  },
  treatment: {
    type: String
  },
  notes: {
    type: String
  },

  // ─── OPD FEE TRACKING ──────────────────────────────────────────────────────
  opdFee: {
    type: Number,
    default: 300
  },
  opdFeePaid: {
    type: Boolean,
    default: false
  },
  opdFeeCollectedAt: {
    type: Date,
    default: null
  },
  opdFeePaymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', ''],
    default: ''
  },
  opdFeeCollectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ─── FLOW TIMESTAMPS ───────────────────────────────────────────────────────
  checkedInAt: { type: Date, default: null },
  vitalsRecordedAt: { type: Date, default: null },
  consultationStartedAt: { type: Date, default: null },
  consultationEndedAt: { type: Date, default: null },
  finalBillGeneratedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },

  // ─── STAFF ASSIGNMENTS & REFS ──────────────────────────────────────────────
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  vitalsRecordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null
  },
  finalBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null
  },
  vitalsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vitals',
    default: null
  },

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
  notifications: [{
    role: String,
    message: String,
    read: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now }
  }],

  // ─── QUEUE MANAGEMENT ──────────────────────────────────────────────────────
  tokenNumber: {
    type: String,
    default: ''
  } // Format: T-001, T-002, etc.

}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ scheduledAt: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ tokenNumber: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);