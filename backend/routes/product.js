const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validationMiddleware');
const auth = require('../middleware/authMiddleware');

// 1. Get smart product suggestions (NEW)
router.post('/suggestions', productController.getProductSuggestions);

// 1.5 Get Budget Optimizer Bundles (NEW)
router.post('/budget-optimizer', productController.getBudgetOptimizer);

// 1.6 Create Product Review (NEW)
router.post('/:id/reviews', auth, productController.createProductReview);

// 2. Get all products (Already exists)
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// 2. DELETE Product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
});

// 3. ADD Product - This will enable adding new products
router.post('/', validateProduct, async (req, res, next) => {
  let { name, price, image, category, description, stock, costPrice } = req.body;
  try {
    // Automatically set costPrice if not provided or is 0
    if (!costPrice || Number(costPrice) === 0) {
      const percentage = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      costPrice = Math.round((price * percentage) / 100);
    }
    
    const newProduct = new Product({ name, price, costPrice, image, category, description, stock });
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    next(err);
  }
});

// 4. UPDATE Product (Edit) - This will resolve the product editing issue
router.put('/:id', validateProduct, async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    
    // Automatically adjust costPrice if price changed and costPrice is missing or 0
    if (updateData.price && (!updateData.costPrice || Number(updateData.costPrice) === 0)) {
      const percentage = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      updateData.costPrice = Math.round((updateData.price * percentage) / 100);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },  //$set means: "Only change the fields that were sent, leave the rest untouched."
      { new: true, runValidators: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

module.exports = router;