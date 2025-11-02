const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'reception', 'patient']
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true
  },
  // Adding patient-specific fields
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  department: {
    type: String
  },
  specialization: {
    type: String
  },
  profileImage: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);