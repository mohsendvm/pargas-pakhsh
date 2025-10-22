// --------------------------------------------------------
// ✅ server.js — نسخه‌ نهایی Production با مانیتورینگ هوشمند + Stage 2.2
// --------------------------------------------------------

require('dotenv').config(); // خواندن متغیرهای محیطی

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const { connectDB, connectToSQL } = require('./config/db.config'); // اتصال دیتابیس‌ها
const logEvent = require('./monitor'); // ✨ اتصال فایل مانیتورینگ هوشمند

const app = express();

// --------------------------------------------------------
// ✅ تنظیمات اولیه سرور
// --------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------------------------
// ✅ مسیر تست سریع برای اطمینان از اجرا
// --------------------------------------------------------
app.get('/', (req, res) => {
    logEvent('ROUTE', 'Root route accessed');
    res.send('✅ Server is running and databases are connected!');
});

// --------------------------------------------------------
// ✅ مسیر /status — HealthCheck و مانیتورینگ لحظه‌ای
// --------------------------------------------------------
app.get('/status', (req, res) => {
    const systemStatus = {
        service: "pargas-pakhsh",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "production",
        mongo_status: global.mongoConnected ? "🟢 MongoDB Connected" : "🔴 MongoDB Disconnected",
        sql_status: global.sqlConnected ? "🟢 MSSQL Connected" : "🔴 MSSQL Disconnected",
        uptime_seconds: Math.floor(process.uptime()),
        last_checked: new Date().toISOString(),
        status_code: 200
    };

    logEvent('STATUS', `HealthCheck responded OK — uptime ${systemStatus.uptime_seconds}s`);
    res.status(200).json(systemStatus);
});

// --------------------------------------------------------
// ✅ مسیر /monitor-log — نمایش لاگ‌ها در مرورگر (Stage 2.2)
// --------------------------------------------------------
app.get('/monitor-log', (req, res) => {
    try {
        const logPath = path.join(__dirname, 'monitor.log');
        const logs = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '📂 No log file found';

        res.send(`
            <html>
            <head><title>Pargas Monitor Log</title></head>
            <body style="font-family: monospace; background-color: #111; color: #0f0;">
                <h2>📜 System Monitor Log</h2>
                <pre>${logs}</pre>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send(`❌ Error reading logs: ${err.message}`);
    }
});

// --------------------------------------------------------
// ✅ جلوگیری از Sleep در Render (KeepAlive هر 9 دقیقه)
// --------------------------------------------------------
setInterval(async () => {
    try {
        const pingUrl = process.env.PING_URL || 'https://pargas-pakhsh.onrender.com/status';
        const res = await fetch(pingUrl);
        logEvent('PING', `پینگ Render ارسال شد با پاسخ ${res.status}`);
    } catch (err) {
        logEvent('PING', `❌ خطا در پینگ Render — ${err.message}`);
    }
}, 9 * 60 * 1000);

// --------------------------------------------------------
// ✅ مسیرهای API پروژه
// --------------------------------------------------------
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// --------------------------------------------------------
// ✅ تابع راه‌اندازی سرور و اتصال دیتابیس‌ها
// --------------------------------------------------------
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB(); // اتصال MongoDB
        global.mongoConnected = true;
        logEvent('DB', '🟢 MongoDB Connected');

        await connectToSQL(); // اتصال MSSQL سپیدار
        global.sqlConnected = true;
        logEvent('DB', '🟢 MSSQL Connected');

        app.listen(PORT, () => {
            logEvent('SERVER', `🟢 Server running on port ${PORT}`);
            console.log(`🟢 Server running on port ${PORT}`);
        });
    } catch (err) {
        logEvent('FATAL', `❌ خطا در راه‌اندازی سرور — ${err.message}`);
        console.error(`❌ خطا در راه‌اندازی سرور: ${err.message}`);
        global.mongoConnected = false;
        global.sqlConnected = false;
    }
};

// 🚀 اجرای سرور اصلی
startServer();

// --------------------------------------------------------
// ✅ Error Handler مرکزی برای خطاهای ناگهانی و Promise
// --------------------------------------------------------
process.on('uncaughtException', (err) => {
    logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
    console.error('❌ Uncaught Exception:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    logEvent('REJECTION', `⚠️ Unhandled Promise Rejection: ${reason}`);
    console.error('⚠️ Unhandled Rejection در Promise:', promise);
    console.error('💬 علت خطا:', reason);
});

