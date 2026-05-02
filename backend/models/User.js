const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
    // Unique property removed to allow duplicate names
  },
  email: {
    type: String,
    required: true,
    unique: true // Email remains unique
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cart: {
    type: Array,
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
});

module.exports = mongoose.model('User', UserSchema);