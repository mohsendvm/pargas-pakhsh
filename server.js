// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // برای خواندن PORT و MONGO_URI

// 📌 اتصال به پایگاه داده
const connectDB = require('./config/db.config');

// 📌 ساخت برنامه Express
const app = express();

// 📌 میان‌افزارها (Middleware)
app.use(cors());
app.use(bodyParser.json()); // برای خواندن داده‌های JSON از درخواست‌ها

// 🟢 مسیر تست
app.get('/', (req, res) => {
  res.send('✅ Server is running and DB Connected!');
});

// 📌 مسیرهای API
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 📌 پورت اجرا
const PORT = process.env.PORT || 3000;

// 📌 اتصال به دیتابیس و اجرای سرور
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🟢 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error(`❌ Database connection failed: ${err.message}`);
});

