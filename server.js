// --------------------------------------------------------
// ✅ server.js — نسخه کاملاً اصلاح‌شده برای اجرای بی‌خطا
// --------------------------------------------------------

require('dotenv').config(); // خواندن متغیرهای محیطی مطمئن از مسیر اصلی

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { connectDB, connectToSQL } = require('./config/db.config'); // ایمپورت توابع اتصال دیتابیس‌ها

const app = express();

// --------------------------------------------------------
// ✅ تنظیمات اولیه سرور
// --------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------------------------
// ✅ مسیر تست اصلی
// --------------------------------------------------------
app.get('/', (req, res) => {
  res.send('✅ Server is running and DB Connected!');
});

// --------------------------------------------------------
// ✅ مسیر بررسی وضعیت اتصال‌ها
// --------------------------------------------------------
app.get('/status', (req, res) => {
  res.json({
    mongo_status: global.mongoConnected ? '🟢 MongoDB Connected' : '🔴 MongoDB Disconnected',
    sql_status: global.sqlConnected ? '🟢 MSSQL Connected' : '🔴 MSSQL Disconnected',
    checked_at: new Date().toLocaleString('fa-IR'),
  });
});

// --------------------------------------------------------
// ✅ جلوگیری از Sleep در Render Free
// --------------------------------------------------------
setInterval(async () => {
  try {
    const pingUrl = process.env.PING_URL || 'https://pargas-pakhsh.onrender.com/status';
    const res = await fetch(pingUrl);
    console.log('⏱️ Ping sent to Render:', res.status);
  } catch (err) {
    console.log('⚠️ Ping failed:', err.message);
  }
}, 9 * 60 * 1000); // هر ۹ دقیقه یک بار

// --------------------------------------------------------
// ✅ مسیرهای API پروژه
// --------------------------------------------------------
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// --------------------------------------------------------
// ✅ اجرای سرور با اتصال دیتابیس‌ها
// --------------------------------------------------------
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB(); // اتصال به MongoDB
    global.mongoConnected = true;

    await connectToSQL(); // اتصال به MSSQL سپیدار
    global.sqlConnected = true;

    app.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`❌ خطا در راه‌اندازی سرور: ${err.message}`);
    global.mongoConnected = false;
    global.sqlConnected = false;
  }
};

// اجرای برنامه
startServer();

