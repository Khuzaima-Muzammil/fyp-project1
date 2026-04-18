const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// @route   POST api/users/update-cart
router.post('/update-cart', auth, async (req, res) => {
  try {
    const { cart } = req.body;
    // req.user.id authMiddleware se aayega
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cart: cart },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// NAYA ROUTE YAHAN HAI 👇
// @route   GET api/users
// @desc    Get all users (Dashboard ginti ke liye)
router.get('/', auth, async (req, res) => {
  try {
    // Database se tamaam users ko nikal rahe hain
    // password ko minus (-) kar rahe hain taake wo secure rahe
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;