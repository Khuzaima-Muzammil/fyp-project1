const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number, // Sale wale items ke liye (jaise $130 cut kar ke $100)
    default: null,
  },
  image: {
    type: String,
    required: true, // Image ka URL ya path
  },
  category: {
    type: String,
    required: true, // e.g., 'Clothes', 'Electronics'
  },
  badge: {
    type: String,
    default: 'NONE', // 'NEW', 'HOT', 'SALE', ya 'NONE'
  },
  rating: {
    type: Number,
    default: 0, // e.g., 4.6
  },
  bgColor: {
    type: String,
    default: '#d3d3df', // Aapke pastel colors ke liye (e.g., '#e09384')
  }
}, {
  timestamps: true // Product kab add hua
});

module.exports = mongoose.model('Product', productSchema);