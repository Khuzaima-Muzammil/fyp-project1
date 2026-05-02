const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessInfo: {
    address: { type: String, default: '123 Street, City, Country' },
    phone: { type: String, default: '+92 300 0000000' },
    email: { type: String, default: 'info@store.com' },
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' }
    }
  },
  shipping: {
    baseRate: { type: Number, default: 250 },
    freeThreshold: { type: Number, default: 5000 }
  },
  currency: {
    code: { type: String, default: 'PKR' },
    symbol: { type: String, default: 'Rs.' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
