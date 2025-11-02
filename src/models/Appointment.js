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
    required: true,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled']
  },
  priority: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'critical']
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
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ scheduledAt: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);