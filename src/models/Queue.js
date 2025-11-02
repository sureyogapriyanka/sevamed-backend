const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
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
  position: {
    type: Number,
    required: true
  },
  estimatedWaitTime: {
    type: Number // in minutes
  },
  status: {
    type: String,
    required: true,
    enum: ['waiting', 'in-consultation', 'completed']
  },
  priority: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'critical']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
queueSchema.index({ patientId: 1 });
queueSchema.index({ doctorId: 1 });
queueSchema.index({ position: 1 });
queueSchema.index({ status: 1 });
queueSchema.index({ priority: 1 });

module.exports = mongoose.model('Queue', queueSchema);