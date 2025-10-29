// ---------------------------------------------------------
// ✅ config/db.config.js — نسخه هماهنگ با ESM
// ---------------------------------------------------------
import dotenv from 'dotenv';
import sql from 'mssql';
import mongoose from 'mongoose';
dotenv.config();

const sqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
    connectionTimeout: 10000,
    requestTimeout: 15000,
  },
};

let pool = null;

export const connectToSQL = async () => {
  try {
    if (pool && pool.connected) return pool;
    pool = await sql.connect(sqlConfig);
    global.sqlConnected = true;
    console.log('🟢 MSSQL متصل شد:', pool.config.server);
    return pool;
  } catch (err) {
    console.error('⚠️ خطای اتصال MSSQL:', err.message);
    global.sqlConnected = false;
    setTimeout(connectToSQL, 5000);
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`🟢 MongoDB متصل شد به ${conn.connection.host}`);
    global.mongoConnected = true;
    return conn;
  } catch (err) {
    console.error('❌ خطای MongoDB:', err.message);
    global.mongoConnected = false;
    setTimeout(connectDB, 5000);
  }
};

// ثبت رویدادهای قطع یا خطا
mongoose.connection.on('disconnected', () => {
  global.mongoConnected = false;
  console.warn('⚠️ MongoDB قطع شد — تلاش برای اتصال مجدد...');
  connectDB();
});

mongoose.connection.on('error', e => console.error('⚠️ خطای MongoDB:', e.message));

export { sql };

