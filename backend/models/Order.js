const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // --- Aapke Purane Fields (Waisay hi hain) ---
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  shippingAddress: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    required: true
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  status: {
    type: String,
    default: 'Pending' // Ye dono schemas mein same tha
  },
  isDelivered: { 
    type: Boolean, 
    required: true, 
    default: false 
  },

  // --- Naye Extra Fields Jo Aapne Add Karwaye ---
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: { type: Number, default: 1 },
      price: Number
    }
  ],
  totalAmount: { 
    type: Number 
  }
  }, {
    timestamps: true // Product kab add hua
  });

module.exports = mongoose.model('Order', orderSchema);