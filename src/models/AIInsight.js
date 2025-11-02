const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['health_tip', 'medication_reminder', 'workflow_suggestion']
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
aiInsightSchema.index({ userId: 1 });
aiInsightSchema.index({ type: 1 });
aiInsightSchema.index({ priority: 1 });
aiInsightSchema.index({ isActive: 1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);