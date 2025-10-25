require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// -------------------- اتصال به سپیدار از .env --------------------
const dbConfig = {
  server: process.env.MSSQL_HOST,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// تابع اتصال
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log('✅ اتصال به SQL سپیدار برقرار شد');
  } catch (err) {
    console.error('❌ خطا در اتصال به سپیدار:', err.message);
  }
}

// -------------------- مسیر تست --------------------
app.get('/', (_, res) => {
  res.send('🚀 Pargas Smart Catalog Active');
});

// -------------------- مسیر محصولات --------------------
app.get('/api/products', async (_, res) => {
  try {
    const result = await sql.query(`
      SELECT TOP 100 ProductID, ProductName, SalePrice, Stock
      FROM Products
      ORDER BY ProductName ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('خطا در خواندن محصولات از سپیدار');
  }
});

// -------------------- مسیر سفارش‌ها --------------------
app.post('/api/orders', async (req, res) => {
  const { CustomerID, OrderDetails } = req.body;
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
    console.error(err);
    res.status(500).send('خطا در ثبت سفارش در سپیدار');
  }
});

// -------------------- راه‌اندازی سرور --------------------
app.listen(PORT, async () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  await connectDB();
});

