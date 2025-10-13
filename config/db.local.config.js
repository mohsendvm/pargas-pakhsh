// db.local.config.js
require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    encrypt: false, // سپیدار SSL نیاز ندارد
    trustServerCertificate: true,
  },
};

const connectSepidar = async () => {
  try {
    await sql.connect(config);
    console.log('✅ MSSQL سپیدار با موفقیت متصل شد!');
  } catch (err) {
    console.error('❌ خطای اتصال MSSQL سپیدار:', err.message);
  }
};

module.exports = connectSepidar;
