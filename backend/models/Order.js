const mongoose = require('mongoose');

// Order schema (Database structure)
const orderSchema = new mongoose.Schema({
  // ID of the user placing the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Items included in the order
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      category: { type: String },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  // Shipping address
  shippingAddress: { 
    type: String, 
    required: true 
  },
  // Customer's phone number
  phone: {
    type: String,
    required: true
  },
  // Total price
  totalPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  // Delivery charges
  deliveryCost: {
    type: Number,
    default: 0
  },
  // Payment method
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  // Current status of the order
  status: {
    type: String,
    default: 'Pending' 
  },
  // Payment status (Has the payment been made?)
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  // Has the order been delivered?
  isDelivered: { 
    type: Boolean, 
    required: true, 
    default: false 
  }
}, {
  timestamps: true // Tracks when the order was created and updated
});

module.exports = mongoose.model('Order', orderSchema);