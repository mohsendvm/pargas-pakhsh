const sql = require('mssql');

const config = {
  user: 'sa',                        // نام کاربری SQL سپیدار
  password: 'رمز_عبور_SQL_سپیدار',   // رمز عبور SQL سپیدار
  server: '192.168.1.100',           // IP ثابت کامپیوتر سپیدار
  database: 'Sepidar',               // نام دیتابیس سپیدار
  options: {
    encrypt: false,                  // سپیدار SSL نیاز ندارد
    trustServerCertificate: true
  }
};

const connectSepidar = async () => {
  try {
    await sql.connect(config);
    console.log('✅ MSSQL Sepidar Connected Successfully!');
  } catch (err) {
    console.error('❌ MSSQL Connection Failed:', err.message);
  }
};

module.exports = connectSepidar;

