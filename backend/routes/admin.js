const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');

// Middleware for admin check
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const productCount = await Product.countDocuments() || 0;
    const userCount = await User.countDocuments() || 0;
    const orderCount = await Order.countDocuments() || 0;

    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
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

// @desc    Get detailed analytics for reports
// @route   GET /api/admin/analytics
router.get('/analytics', auth, adminOnly, async (req, res) => {
  try {
    // 1. Monthly Sales Data (Existing)
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 2. Best Sellers (Existing)
    const bestSellers = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 }
    ]);

    // 3. Inventory & Profit Metrics
    const allProducts = await Product.find({});
    
    // Total Inventory Value = Σ (Product Price * Stock)
    const totalInventoryValue = allProducts.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
    
    // Estimated Profit = Σ ((Price - CostPrice) * Stock)
    const estimatedPotentialProfit = allProducts.reduce((acc, p) => {
      const profitPerUnit = p.price - (p.costPrice || 0);
      return acc + (profitPerUnit * (p.stock || 0));
    }, 0);

    // Potential Revenue = Total Sales so far + Value of remaining stock
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
    ]);
    const actualRevenueSoFar = revenueData.length > 0 ? revenueData[0].totalSales : 0;
    const totalPotentialRevenue = actualRevenueSoFar + totalInventoryValue;

    // Actual Profit So Far (from orders)
    const ordersWithItems = await Order.find({}).populate('orderItems.product');
    let actualProfitSoFar = 0;
    ordersWithItems.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product) {
          const cost = item.product.costPrice || 0;
          actualProfitSoFar += (item.price - cost) * item.quantity;
        }
      });
    });

    // --- PROFESSIONAL METRICS (New) ---
    
    // 4. Low Stock Alerts (Stock < 10)
    const lowStockProducts = allProducts
      .filter(p => (p.stock || 0) < 10)
      .map(p => ({ name: p.name, stock: p.stock, id: p._id }));

    // 5. Category-wise Revenue Breakdown
    const categoryRevenue = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.category",
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
          unitsSold: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 6. Order Status Breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          value: { $sum: "$totalPrice" }
        }
      }
    ]);

    // 7. Average Order Value (AOV) & Total Units Sold
    const totalOrders = await Order.countDocuments();
    const totalUnitsSoldData = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalUnits: { $sum: "$orderItems.quantity" } } }
    ]);
    const totalUnitsSold = totalUnitsSoldData.length > 0 ? totalUnitsSoldData[0].totalUnits : 0;
    const averageOrderValue = totalOrders > 0 ? (actualRevenueSoFar / totalOrders) : 0;

    res.json({
      monthlySales,
      bestSellers,
      inventoryMetrics: {
        totalInventoryValue,
        totalPotentialRevenue,
        estimatedPotentialProfit,
        actualRevenueSoFar,
        actualProfitSoFar,
        averageOrderValue,
        totalOrders,
        totalUnitsSold
      },
      lowStockProducts,
      categoryRevenue,
      orderStatusBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
});

// @desc    Randomize cost price for all products (Admin only)
// @route   POST /api/admin/randomize-costs
router.post('/randomize-costs', auth, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      // Cost price between 60% and 85% of selling price
      const percentage = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      const newCost = Math.round((product.price * percentage) / 100);
      
      product.costPrice = newCost;
      await product.save();
      updatedCount++;
    }

    res.json({ 
      success: true, 
      message: `Successfully randomized cost prices for ${updatedCount} products.`,
      updatedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Randomization error" });
  }
});

module.exports = router;