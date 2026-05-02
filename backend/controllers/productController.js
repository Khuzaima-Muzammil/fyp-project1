// Importing models
const Product = require('../models/Product');
const User = require('../models/User');
const Admin = require('../models/Admin');

// @desc    Suggest cheaper products based on the budget
// @route   POST /api/products/suggestions
exports.getProductSuggestions = async (req, res) => {
  console.log("Suggestions Request Received:", new Date().toISOString());
  try {
    const { cartItems, userBudget, overAmount } = req.body;
    
    // If the cart is empty, return an empty array
    if (!cartItems || cartItems.length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    // Fetching all products from the database
    const allProducts = await Product.find({}).lean();

    // Finding the most expensive item in the cart
    const mostExpensiveInCart = Math.max(...cartItems.map(i => i.price));

    // Filtering potential alternatives that are cheaper and not already in the cart
    const potentialAlternatives = allProducts.filter(p => {
      const isNotAlreadyInCart = !cartItems.some(item => (item._id || item.id || "").toString() === p._id.toString());
      const isCheaper = p.price < mostExpensiveInCart;
      return isNotAlreadyInCart && isCheaper;
    });

    if (potentialAlternatives.length === 0) {
      return res.json({ 
        success: true, 
        suggestions: [], 
        message: "No cheaper alternatives found."
      });
    }

    // Selecting top 3 cheaper alternatives with the best rating
    const limitedAlternatives = potentialAlternatives
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    // Preparing suggestions
    const suggestions = limitedAlternatives.map((alt, index) => {
      const sameCategoryInCart = cartItems.find(item => item.category === alt.category);
      const originalItem = sameCategoryInCart || cartItems[0];

      return {
        originalId: originalItem._id || originalItem.id,
        suggestedId: alt._id,
        reason: `This ${alt.category} is cheaper and of good quality.`,
        priceDifference: originalItem.price - alt.price,
        originalProduct: originalItem,
        suggestedProduct: alt
      };
    });

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("Suggestions Error:", error);
    res.status(500).json({ success: false, message: "An error occurred", error: error.message });
  }
};

// @desc    Creating best combinations (Bundles) based on the budget
// @route   POST /api/products/budget-optimizer
exports.getBudgetOptimizer = async (req, res) => {
  try {
    const { budget, category } = req.body;
    
    if (!budget || !category) {
      return res.status(400).json({ success: false, message: "Budget and category are required." });
    }

    const budgetNum = Number(budget);

    // Finding products based on category
    const products = await Product.find({ category: new RegExp('^' + category + '$', 'i') }).lean();

    if (products.length === 0) {
      return res.json({ success: true, bundles: [], message: `No items found in this category: ${category}` });
    }

    const bundles = [];

    // Bundle 1: Maximum items (Cheapest first)
    let sortedByPrice = [...products].sort((a, b) => a.price - b.price);
    let currentTotal = 0;
    let maxItemsBundle = [];
    
    for (let p of sortedByPrice) {
      if (currentTotal + p.price <= budgetNum) {
        maxItemsBundle.push(p);
        currentTotal += p.price;
      }
    }
    
    if (maxItemsBundle.length > 0) {
      bundles.push({
        name: "Max Items Bundle",
        description: "Get more items for less money.",
        items: maxItemsBundle,
        totalPrice: currentTotal
      });
    }

    // Bundle 2: Best Quality (Highest rating first)
    let sortedByRating = [...products].sort((a, b) => b.rating - a.rating);
    currentTotal = 0;
    let premiumBundle = [];
    
    for (let p of sortedByRating) {
      if (currentTotal + p.price <= budgetNum) {
        premiumBundle.push(p);
        currentTotal += p.price;
      }
    }

    const premiumIds = premiumBundle.map(p => p._id.toString()).sort().join(',');
    const maxItemsIds = maxItemsBundle.map(p => p._id.toString()).sort().join(',');
    
    if (premiumBundle.length > 0 && premiumIds !== maxItemsIds) {
      bundles.push({
        name: "Best Quality Bundle (Premium Selection)",
        description: "High-rated items that fit your budget.",
        items: premiumBundle,
        totalPrice: currentTotal
      });
    }

    // Bundle 3: One Premium Item (Best and most expensive within budget)
    let singlePremium = [...products].filter(p => p.price <= budgetNum).sort((a, b) => b.price - a.price)[0];
    if (singlePremium) {
       const singleId = singlePremium._id.toString();
       if ((!maxItemsBundle.find(i => i._id.toString() === singleId) || maxItemsBundle.length > 1) && 
           (!premiumBundle.find(i => i._id.toString() === singleId) || premiumBundle.length > 1)) {
         bundles.push({
           name: "Single Premium Pick",
           description: "The single best item available within this budget.",
           items: [singlePremium],
           totalPrice: singlePremium.price
         });
       }
    }

    if (bundles.length === 0) {
       return res.json({ success: true, bundles: [], message: "Budget is too low." });
    }

    res.json({ success: true, bundles });

  } catch (error) {
    console.error("Budget Optimizer Error:", error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

// @desc    Creating a product review
// @route   POST /api/products/:id/reviews
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    if (product) {
      // Checking if the user has already reviewed the product
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === userId.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

      // Fetching the reviewer's name
      let userAccount = await User.findById(userId) || await Admin.findById(userId);
      const reviewerName = userAccount ? (userAccount.username || userAccount.name) : "Customer";

      const review = {
        name: reviewerName,
        rating: Number(rating),
        comment,
        user: userId,
      };

      // Saving the review in the product document
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ success: true, message: 'Review added' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ success: false, message: "Review could not be saved" });
  }
};