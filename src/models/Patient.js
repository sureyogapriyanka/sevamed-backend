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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
patientSchema.index({ userId: 1 });

module.exports = mongoose.model('Patient', patientSchema);