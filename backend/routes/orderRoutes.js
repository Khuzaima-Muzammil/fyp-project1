const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');

// --------------------------------------------------------
// 1. Create Order (Aapka original logic + Naye fields)
// @route    POST /api/orders
// --------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, phone, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // User ID nikalne ka sab se mehfooz tareeka
    const userId = req.user.id || req.user._id;

    const order = new Order({
      // --- Aapka Purana Data ---
      user: userId, 
      orderItems: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item.product
      })),
      shippingAddress,
      phone,
      totalPrice,

      // --- Naye Fields (Admin Dashboard ke liye) ---
      userId: userId, // Duplicate for admin reference
      totalAmount: totalPrice, // Duplicate for admin reference
      products: orderItems.map(item => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price
        //User Side (Purana Data): Aapka frontend shayad orderItems mang raha hai taake user ko uska bill dikhaye.
        //Admin Side (Naya Data): Aapka Admin Panel shayad products ka array mang raha hai taake woh inventory check kar sake.
      }))
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Order Save Error:", error.message);
    
    // AGAR DUPLICATE KEY ERROR AAYE TOH YE MSG DIKHAYE GA yani mongodb me duplicated cheeze add krnai ki koshish krai gai tu error aye ga
    if (error.code === 11000) {
        return res.status(400).json({ 
            message: "Database Index Error: Please delete 'orderCode' index from MongoDB Compass." 
        });
    }
    
    res.status(500).json({ message: error.message });
  }
});


// --------------------------------------------------------
// 2. Get My Orders (Aapka original User ke liye route)
// @route    GET /api/orders/myorders
// --------------------------------------------------------
router.get('/myorders', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// --------------------------------------------------------
// 3. Get All Orders (Naya Route - Admin Dashboard ke liye)
// @route    GET /api/orders
// --------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Populate se user ki details (name, email) bhi aa jayengi
    // (Purane aur naye dono fields ko populate kar diya taake "Unknown" ka masla na aaye)
    const orders = await Order.find()
      .populate('userId', 'name email') //admin dashboard kai liye kaam ata hai ye
      .populate('user', 'name email') 
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Orders fetch karne mein masla hai' });
  }
});


// --------------------------------------------------------
// 4. Update Order Status (Admin ke liye)
// @route    PUT /api/orders/:id/status
// --------------------------------------------------------
router.put('/:id/status', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }, //Frontend se jo naya status (e.g., "Delivered") bheja gaya hai, woh database mein save kar diya jata hai.
      { new: true }  //Frontend se jo naya status (e.g., "Delivered") bheja gaya hai, woh database mein save kar diya jata hai.
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Status update karne mein masla aya' });
  }
});

module.exports = router;