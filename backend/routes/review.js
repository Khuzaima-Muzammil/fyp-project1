const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });

    const savedReview = await review.save();
    
    // Update product rating and count
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Review Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'username');
    
    // Transform username to name for frontend consistency
    const transformedReviews = reviews.map(r => {
      const obj = r.toObject();
      if (obj.user && obj.user.username) {
        obj.user.name = obj.user.username;
      } else if (obj.user) {
        obj.user.name = 'Unknown User';
      }
      return obj;
    });
    
    res.json(transformedReviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all reviews (for admin)
// @route   GET /api/reviews
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    const reviews = await Review.find()
      .populate('user', 'username email')
      .populate('product', 'name');
    
    // Transform username to name for frontend consistency
    const transformedReviews = reviews.map(r => {
      const obj = r.toObject();
      if (obj.user && obj.user.username) {
        obj.user.name = obj.user.username;
      } else if (obj.user) {
        obj.user.name = 'Unknown User';
      }
      return obj;
    });
    
    res.json(transformedReviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;