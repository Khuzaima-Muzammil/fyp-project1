const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/authMiddleware');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    const { code, discountType, discountAmount, minPurchase, expiryDate } = req.body;
    
    // 1. Coupon Code Validation
    if (!code || code.trim().length < 3 || code.trim().length > 15) {
      return res.status(400).json({ message: "Coupon code must be between 3 and 15 characters" });
    }
    
    const formattedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: formattedCode });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    
    // 2 & 3. Discount Value & Min Purchase Validation
    const amount = Number(discountAmount);
    const minPurch = Number(minPurchase);
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Discount value must be a positive number greater than 0" });
    }
    if (isNaN(minPurch) || minPurch < 0) {
      return res.status(400).json({ message: "Minimum purchase must be 0 or a positive number" });
    }
    
    if (discountType === 'percentage' && amount > 100) {
      return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
    }
    
    if (discountType === 'fixed' && amount >= minPurch && minPurch !== 0) {
      return res.status(400).json({ message: "Fixed discount cannot be greater than or equal to the minimum purchase" });
    }
    if (discountType === 'fixed' && minPurch === 0) {
       return res.status(400).json({ message: "Fixed discount requires a minimum purchase greater than the discount" });
    }
    
    // 4. Expiry Date Validation
    const selectedDate = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
    
    if (isNaN(selectedDate.getTime()) || selectedDate <= today) {
      return res.status(400).json({ message: "Expiry date must be a future date" });
    }

    const coupon = new Coupon({
      code: formattedCode,
      discountType,
      discountAmount: amount,
      minPurchase: minPurch,
      expiryDate: selectedDate
    });
    
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Validate a coupon (Public)
// @route   POST /api/coupons/validate
// @access  Private/User
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }
    
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of ${coupon.minPurchase} required` });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountAmount) / 100;
    } else {
      discount = coupon.discountAmount;
    }
    
    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      discountValue: discount
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
