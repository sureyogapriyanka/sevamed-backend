const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'on-break']
  },
  location: {
    type: String,
    enum: ['lab', 'icu', 'desk', 'resting', 'lunch']
  },
  totalHours: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
attendanceSchema.index({ userId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);