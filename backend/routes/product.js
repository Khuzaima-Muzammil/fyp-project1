const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 

// 1. Get all products (Pehle se mojud hai)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DELETE Product - YE WALA HISSA ADD KAREIN
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product nahi mila' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product delete ho gaya' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. ADD Product - Is se aapka "Add Product" kaam karne lagega
router.post('/', async (req, res) => {
  const { name, price, image, category, description } = req.body;
  try {
    const newProduct = new Product({ name, price, image, category, description });
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE Product (Edit) - Is se Edit wala masla hal hoga
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },  //$set ka matlab hai: "Sirf wahi cheez badlo jo bhei gayi hai, baaki ko mat chhero."
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;