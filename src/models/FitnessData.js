const mongoose = require('mongoose');

const fitnessDataSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  steps: {
    type: Number
  },
  waterIntake: {
    type: Number // glasses
  },
  sleepHours: {
    type: String
  },
  exerciseMinutes: {
    type: Number
  },
  heartRate: {
    type: Number
  },
  bloodPressure: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fitnessDataSchema.index({ patientId: 1 });
fitnessDataSchema.index({ date: 1 });

module.exports = mongoose.model('FitnessData', fitnessDataSchema);