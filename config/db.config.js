// --------------------------------------------------------
// ✅ config/db.config.js — نسخه نهایی کاملاً سازگار با Render و محیط لوکال
// --------------------------------------------------------

require('dotenv').config({ path: __dirname + '/../.env' }); // اطمینان از خواندن فایل .env از ریشه پروژه

const sql = require('mssql');
const mongoose = require('mongoose');

// --------------------------------------------------------
// ✅ تنظیمات اتصال به MSSQL سپیدار
// --------------------------------------------------------
const sqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST, // ← اگر سرور سپیدار در localhost یا IP است، همینجا مقدار بده
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
  },
};

let pool = null;

const connectToSQL = async () => {
  try {
    if (pool) await pool.connect();
    else pool = await sql.connect(sqlConfig);

    console.log('✅ MSSQL سپیدار متصل شد');
    global.sqlConnected = true;
    return pool;
  } catch (err) {
    console.error('⚠️ خطا در اتصال MSSQL:', err.message);
    global.sqlConnected = false;
    setTimeout(connectToSQL, 5000); // تلاش مجدد خودکار هر ۵ ثانیه
  }
};

// --------------------------------------------------------
// ✅ تنظیمات اتصال به MongoDB Atlas
// --------------------------------------------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ خطای اتصال MongoDB: ${err.message}`);
    process.exit(1); // توقف برنامه اگر Mongo وصل نشود
  }
};

// --------------------------------------------------------
// ✅ صادر کردن توابع برای server.js
// --------------------------------------------------------
module.exports = { connectToSQL, connectDB, sql };

