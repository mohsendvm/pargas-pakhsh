const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// مسیر فایل‌های استاتیک (مثل CSS، JS، تصاویر)
app.use(express.static(path.join(__dirname, 'public')));

// وقتی کسی به / میاد، index.html رو بده
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// نمونه API ثبت سفارش
app.post('/order', (req, res) => {
  const order = req.body;
  console.log('دریافت سفارش:', order);
  res.json({ message: 'سفارش ثبت شد' });
});

// پورت مناسب را از Render بگیر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
