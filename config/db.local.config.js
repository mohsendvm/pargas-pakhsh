// db.local.config.js
require('dotenv').config();
const sql = require('mssql');

// ⚙️ تنظیمات اتصال به MSSQL سپیدار از طریق متغیرهای .env
const config = {
  user: process.env.MSSQL_USER,           // نام کاربری مثلاً: sa
  password: process.env.MSSQL_PASSWORD,   // رمز SQL
  server: process.env.MSSQL_SERVER,       // IP داخلی یا عمومی، مثلاً: 192.168.1.100
  database: process.env.MSSQL_DATABASE,   // نام دیتابیس سپیدار
  port: parseInt(process.env.MSSQL_PORT, 10) || 1433,

options: {
  encrypt: false,
  trustServerCertificate: true,
  enableArithAbort: true,
  cryptoCredentialsDetails: {
    minVersion: 'TLSv1'
  },
  connectionTimeout: 30000
}


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

