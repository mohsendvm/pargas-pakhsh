<<<<<<< HEAD
// routes/order.routes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/core/order.model');

// 📌 دریافت همه سفارش‌ها
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 ثبت سفارش جدید
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 بروزرسانی سفارش
router.put('/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 حذف سفارش
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'سفارش حذف شد' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

=======
// routes/order.routes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/core/order.model');

// 📌 دریافت همه سفارش‌ها
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 ثبت سفارش جدید
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 بروزرسانی سفارش
router.put('/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 حذف سفارش
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'سفارش حذف شد' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

>>>>>>> 8afd6862d69991219988e55d2c13f37d6b125136
