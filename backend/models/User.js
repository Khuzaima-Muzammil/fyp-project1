const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' }, // Add this field
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  cart: { type: Array, default: [] }
});

module.exports = mongoose.model('User', UserSchema);