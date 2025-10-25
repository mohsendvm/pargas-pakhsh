// -------------------- تنظیمات اولیه --------------------
require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// -------------------- کانفیگ اتصال MSSQL (سپیدار) --------------------
const dbConfig = {
  server: process.env.MSSQL_HOST,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    encrypt: false,              // برای سرورهای داخلی
    trustServerCertificate: true // پذیرش سرتیفیکیت لوکال
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// -------------------- تابع اتصال --------------------
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log('✅ اتصال به SQL سپیدار برقرار شد');
  } catch (err) {
    console.error('❌ خطا در اتصال به سپیدار:', err);
  }
}

// -------------------- مسیر تست اولیه --------------------
app.get('/', (_, res) => {
  res.send('🚀 Pargas Smart Catalog Active - اتصال SQL در حال بررسی است...');
});

// -------------------- مسیر محصولات --------------------
app.get('/api/products', async (_, res) => {
  try {
    // ⚠️ تست فقط برای شناسایی جدول‌های موجود در سپیدار:
    const result = await sql.query(`SELECT TOP 20 [name] FROM sys.tables`);
    console.log('📦 جداول موجود در سپیدار:', result.recordset.map(r => r.name));
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ خطا هنگام خواندن محصولات:', err);
    res.status(500).send('خطا در خواندن محصولات از سپیدار');
  }
});

// -------------------- مسیر سفارش‌ها --------------------
app.post('/api/orders', async (req, res) => {
  const { CustomerID, OrderDetails } = req.body || {};
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input('CustomerID', sql.Int, CustomerID);
    request.input('OrderDetails', sql.NVarChar(sql.MAX), JSON.stringify(OrderDetails));

    await request.query(`
      INSERT INTO Orders (CustomerID, OrderDetails, OrderDate)
      VALUES (@CustomerID, @OrderDetails, GETDATE());
    `);

    res.send('✅ سفارش با موفقیت ثبت شد');
  } catch (err) {
    console.error('❌ خطا در ثبت سفارش:', err);
    res.status(500).send('خطا در ثبت سفارش در سپیدار');
  }
});

// -------------------- راه‌اندازی سرور --------------------
app.listen(PORT, async () => {
  console.log(`🌐 سرور در حال اجرا روی ://localhost:${PORT}`);
  await connectDB();
});

