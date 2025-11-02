const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    required: true,
    enum: ['direct', 'broadcast', 'emergency']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);