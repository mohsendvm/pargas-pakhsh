// --------------------------------------------------------
// ✅ server.js — نسخه نهایی Production با مسیر وضعیت هوشمند
// --------------------------------------------------------

require('dotenv').config(); // خواندن متغیرهای محیطی

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { connectDB, connectToSQL } = require('./config/db.config'); // اتصال دیتابیس‌ها

const app = express();

// --------------------------------------------------------
// ✅ تنظیمات اولیه سرور
// --------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------------------------
// ✅ مسیر تست سریع برای اطمینان از اجرا
// --------------------------------------------------------
app.get('/', (req, res) => {
  res.send('✅ Server is running and databases are connected!');
});

// --------------------------------------------------------
// ✅ مسیر /status — بهینه‌شده برای HealthCheck و مانیتورینگ
// --------------------------------------------------------
app.get('/status', (req, res) => {
  const systemStatus = {
    service: "pargas-pakhsh",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    mongo_status: global.mongoConnected ? "🟢 MongoDB Connected" : "🔴 MongoDB Disconnected",
    sql_status: global.sqlConnected ? "🟢 MSSQL Connected" : "🔴 MSSQL Disconnected",
    uptime_seconds: Math.floor(process.uptime()),
    last_checked: new Date().toISOString(),
    status_code: 200
  };

  res.status(200).json(systemStatus);
});

// --------------------------------------------------------
// ✅ جلوگیری از Sleep در پلن رایگان Render (KeepAlive every 9min)
// --------------------------------------------------------
setInterval(async () => {
  try {
    const pingUrl = process.env.PING_URL || 'https://pargas-pakhsh.onrender.com/status';
    const res = await fetch(pingUrl);
    console.log('⏱️ Ping sent to Render:', res.status);
  } catch (err) {
    console.log('⚠️ Ping failed:', err.message);
  }
}, 9 * 60 * 1000);

// --------------------------------------------------------
// ✅ مسیرهای API اصلی پروژه
// --------------------------------------------------------
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// --------------------------------------------------------
// ✅ تابع اصلی راه‌اندازی سرور و اتصال دیتابیس‌ها
// --------------------------------------------------------
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB(); // اتصال MongoDB
    global.mongoConnected = true;

    await connectToSQL(); // اتصال MSSQL سپیدار
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

// 🚀 اجرای سرور اصلی
startServer();

// --------------------------------------------------------
// ✅ Error Handler مرکزی برای ردیابی خطاهای پنهان و Promise
// --------------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection در Promise:', promise);
  console.error('💬 علت خطا:', reason);
});

