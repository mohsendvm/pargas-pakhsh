// ------------------------------------------------------------
// ✅ server.js — نسخه نهایی Stage 4 AI + Security + Monitoring
// ------------------------------------------------------------
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import fetch from 'node-fetch';
import { connectDB, connectToSQL } from './config/db.config.js';
import { logEvent } from './monitor.js';
import { recommend } from './ai/recommender.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ صفحه ریشه
app.get('/', (req, res) => {
  logEvent('ROUTE', 'Root route accessed');
  res.send('✅ Pargas server running successfully!');
});

// ✅ HealthCheck
app.get('/status', (req, res) => {
  const systemStatus = {
    service: 'pargas-pakhsh',
    version: '1.2.0',
    mongo_status: global.mongoConnected ? '🟢 Mongo Connected' : '🔴 Mongo Disconnected',
    sql_status: global.sqlConnected ? '🟢 MSSQL Connected' : '🔴 MSSQL Disconnected',
    uptime_seconds: Math.floor(process.uptime()),
    last_checked: new Date().toISOString(),
    sql_server: process.env.MSSQL_HOST,
    sql_db: process.env.MSSQL_DATABASE,
  };
  logEvent('STATUS', `HealthCheck OK — uptime ${systemStatus.uptime_seconds}s`);
  res.status(200).json(systemStatus);
});

// ✅ مشاهده لاگ‌ها
app.get('/monitor-log', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'monitor.log');
    const logs = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '📂 No log file found';
    res.send(`
      <html><body style="background:#111;color:#0f0;font-family:monospace">
      <h2>📜 System Monitor Log</h2><pre>${logs}</pre>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send(`❌ Error reading logs: ${err.message}`);
  }
});

// ✅ امنیت SQL
app.get('/whoami', async (req, res) => {
  try {
    const result = await sql.query`SELECT SYSTEM_USER AS SqlLogin, ORIGINAL_LOGIN() AS OriginalLogin`;
    const login = result.recordset[0];
    if (login.SqlLogin.toLowerCase() === 'sa') {
      logEvent('SECURITY', '⚠️ هشدار: اتصال با کاربر "sa" انجام شده است!');
    } else {
      logEvent('SECURITY', `✅ اتصال امن با کاربر "${login.SqlLogin}"`);
    }
    res.json(login);
  } catch (err) {
    logEvent('SECURITY', `❌ خطا در /whoami — ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Stage 4 — موتور هوش مصنوعی
app.get('/api/recommendations/:id', async (req, res) => {
  try {
    const config = {
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      server: process.env.MSSQL_HOST,
      database: process.env.MSSQL_DATABASE,
      options: { encrypt: false, trustServerCertificate: true },
    };
    const pool = await sql.connect(config);
    const query = `
      SELECT TOP (200)
      I.ItemID, I.Title, I.ItemCategoryTitle AS Category,
      ISNULL(S.Quantity,0) AS StockQty,
      ISNULL(P.Price,0) AS SalePrice
      FROM INV.vwItem AS I
      LEFT JOIN INV.vwItemStockSummary AS S ON I.ItemID = S.ItemRef
      LEFT JOIN INV.vwProducedItemPrice AS P ON I.ItemID = P.ItemRef
      ORDER BY I.Code;
    `;
    const result = await pool.request().query(query);
    const products = result.recordset;
    const userHistory = [];
    const recommendations = await recommend(products, userHistory);
    logEvent('AI', `✅ Recommendations generated (${recommendations.length})`);
    res.json({ ok: true, recommendations });
  } catch (err) {
    logEvent('AI', `❌ Error generating recommendations — ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 🔄 جلوگیری از Sleep در Render
setInterval(async () => {
  try {
    const pingUrl = process.env.PING_URL || 'https://pargas-pakhsh.onrender.com/status';
    const res = await fetch(pingUrl);
    logEvent('PING', `✅ Ping Render (${res.status})`);
  } catch (err) {
    logEvent('PING', `❌ Error in Render ping — ${err.message}`);
  }
}, 9 * 60 * 1000);

// 🚀 راه‌اندازی نهایی سرور
const startServer = async () => {
  try {
    await connectDB();
    global.mongoConnected = true;
    logEvent('DB', '🟢 MongoDB Connected');
    await connectToSQL();
    global.sqlConnected = true;
    logEvent('DB', '🟢 MSSQL Connected');
    app.listen(PORT, () => {
      logEvent('SERVER', `✅ Server running on port ${PORT}`);
      console.log(`🟢 Server running on port ${PORT}`);
    });
  } catch (err) {
    logEvent('FATAL', `❌ خطا در راه‌اندازی سرور — ${err.message}`);
    console.error(err);
  }
};

startServer();

// 🧠 هندلرهای خطا
process.on('uncaughtException', err => {
  logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
  console.error(err);
});

process.on('unhandledRejection', reason => {
  logEvent('REJECTION', `⚠️ Unhandled Rejection: ${reason}`);
  console.error(reason);
});

