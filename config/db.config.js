// --------------------------------------------------------
// ✅ config/db.config.js — نسخه‌ی نهایی هماهنگ با Render و محیط لوکال
// --------------------------------------------------------

require('dotenv').config(); // خواندن متغیرهای .env از ریشه پروژه

const sql = require('mssql');
const mongoose = require('mongoose');

// --------------------------------------------------------
// ✅ تنظیمات اتصال به MSSQL سپیدار
// --------------------------------------------------------

const sqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST, // IP یا نام سرور سپیدار
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false, // اگر در شبکه داخلی (بدون SSL) هستی false — برای Render یا Azure: true
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
    connectionTimeout: 10000,     // زمان انتظار اتصال (ms)
    requestTimeout: 15000,        // زمان انتظار درخواست (ms)
  },
};

let pool = null;

// --------------------------------------------------------
// 🧩 تابع اتصال به MSSQL با پایداری خودکار و مدیریت خطا
// --------------------------------------------------------

const connectToSQL = async () => {
  try {
    // بررسی اتصال موجود و استفادهٔ مجدد به جای ساخت اتصال جدید
    if (pool && pool.connected) return pool;

    pool = await sql.connect(sqlConfig);
    global.sqlConnected = true;
    console.log('🟢 MSSQL سپیدار متصل شد با شناسه:', pool.config.server);
    return pool;
  } catch (err) {
    console.error('⚠️ خطا در اتصال MSSQL:', err.message);
    global.sqlConnected = false;

    // تلاش خودکار برای اتصال مجدد بعد از ۵ ثانیه (بدون crash)
    setTimeout(connectToSQL, 5000);
  }
};

// --------------------------------------------------------
// ✅ تنظیمات اتصال به MongoDB Atlas (نسخه‌ی جدید Mongoose v8)
// --------------------------------------------------------

const connectDB = async () => {
  try {
    // در نسخه‌های جدید نیازی به useNewUrlParser و useUnifiedTopology نیست
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // زمان انتظار انتخاب سرور
      connectTimeoutMS: 10000,
    });

    global.mongoConnected = true;
    console.log(`🟢 MongoDB متصل شد به هاست: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    global.mongoConnected = false;
    console.error(`❌ خطای اتصال MongoDB: ${err.message}`);
    // تلاش مجدد خودکار بدون توقف کل برنامه
    setTimeout(connectDB, 5000);
  }
};

// --------------------------------------------------------
// 🧩 کنترل خروجی جهت جلوگیری از crash هنگام قطع لحظه‌ای اتصال
// --------------------------------------------------------

mongoose.connection.on('disconnected', () => {
  global.mongoConnected = false;
  console.warn('⚠️ MongoDB قطع شد — تلاش برای اتصال مجدد...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ خطای MongoDB:', err.message);
});

// --------------------------------------------------------
// ✅ صادر کردن توابع برای استفاده در server.js
// --------------------------------------------------------

module.exports = { connectToSQL, connectDB, sql };

