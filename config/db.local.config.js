// db.local.config.js
require('dotenv').config();
const sql = require('mssql');

// ⚙️ تنظیمات اتصال به MSSQL سپیدار از طریق متغیرهای .env
const config = {
  user: process.env.MSSQL_USER,           // نام کاربری مثلاً: 
  password: process.env.MSSQL_PASSWORD,   // رمز SQL
  server: process.env.MSSQL_HOST,       // IP داخلی یا عمومی، مثلاً: 
  database: process.env.MSSQL_DATABASE,   // نام دیتابیس سپیدار
  port: parseInt(process.env.MSSQL_PORT, 10) || 1433,

  options: {
    encrypt: false,                 // 💡 مهم: غیرفعال سازی کامل SSL/TLS
    trustServerCertificate: true,   // 💡 اجازه اتصال بدون گواهی SSL معتبر
    enableArithAbort: true,         // پایداری در پردازش تراکنش‌ها
    connectionTimeout: 30000        // زمان انتظار (۳۰ ثانیه)
  },
};

// 🔌 تابع اتصال به دیتابیس سپیدار
const connectSepidar = async () => {
  try {
    await sql.connect(config);
    console.log('✅ MSSQL سپیدار با موفقیت متصل شد!');
  } catch (err) {
    console.error('❌ خطای اتصال MSSQL سپیدار:', err.message);
  }
};

// 📤 خروج تابع برای استفاده در server.js
module.exports = connectSepidar;


