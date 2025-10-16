<<<<<<< HEAD
// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/core/product.model');

// 📌 دریافت همه محصولات
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 افزودن محصول جدید
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 بروزرسانی محصول
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 حذف محصول
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'محصول حذف شد' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

=======
// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/core/product.model');

// 📌 دریافت همه محصولات
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 افزودن محصول جدید
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 بروزرسانی محصول
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 حذف محصول
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'محصول حذف شد' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

>>>>>>> 8afd6862d69991219988e55d2c13f37d6b125136
