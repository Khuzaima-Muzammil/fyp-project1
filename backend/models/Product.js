const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  oldPrice: {
    type: Number, // For items on sale (e.g., $130 crossed out to $100)
    default: null,
  },
  image: {
    type: String,
    required: true, // Image URL or path
  },
  category: {
    type: String,
    required: true, // e.g., 'Clothes', 'Electronics'
  },
  badge: {
    type: String,
    default: 'NONE', // 'NEW', 'HOT', 'SALE', or 'NONE'
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bgColor: {
    type: String,
    default: '#d3d3df', // For pastel background colors (e.g., '#e09384')
  },
  priceHistory: [
    {
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true // Track when the product was added
});

module.exports = mongoose.model('Product', productSchema);