const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/authMiddleware');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({});
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    const { businessInfo, shipping, currency } = req.body;
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.businessInfo = businessInfo || settings.businessInfo;
      settings.shipping = shipping || settings.shipping;
      settings.currency = currency || settings.currency;
      await settings.save();
    } else {
      settings = new Settings({ businessInfo, shipping, currency });
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
