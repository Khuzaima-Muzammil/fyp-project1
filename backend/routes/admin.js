const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order'); // Check karein ye file bani hui hai ya nahi

router.get('/stats', async (req, res) => {
  try {
    const productCount = await Product.countDocuments() || 0;
    const userCount = await User.countDocuments() || 0;
    const orderCount = await Order.countDocuments() || 0;

    // Revenue calculate karne ke liye
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalSales : 0;

    res.json({
      products: productCount,
      users: userCount,
      orders: orderCount,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: "Stats error" });
  }
});

module.exports = router;