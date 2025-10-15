// ---------------------------------------------------------------------
// ✅ بخش ۱: وارد کردن ماژول‌ها و تنظیمات اولیه
// ---------------------------------------------------------------------
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

// اتصال به MongoDB (از فایل config/db.config.js)
const connectDB = require('./config/db.config')

// 💡 ماژول اتصال پایدار MSSQL (شامل Auto-Reconnect)
const { connectToSQL } = require('./dbConnect')

// برای پینگ خودکار ضد Sleep
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// ساخت برنامه Express
const app = express()
app.use(cors())
app.use(bodyParser.json())

// ---------------------------------------------------------------------
// ✅ بخش ۲: اتصال اولیه MSSQL و مسیرهای سلامتی
// ---------------------------------------------------------------------
connectToSQL() // در شروع سرور، اتصال به سپیدار برقرار شود

// مسیر تست اصلی
app.get('/', (req, res) => {
  res.send('✅ Server is running and MSSQL (Sepidar) is auto-managed!')
})

// مسیر سلامت برای مانیتورینگ Render
app.get('/status', (req, res) => {
  res.status(200).json({
    uptime_seconds: process.uptime(),
    sql_status: global.sqlConnected ? '🟢 MSSQL Connected' : '🔴 MSSQL Disconnected',
    checked_at: new Date().toLocaleString('fa-IR')
  })
})

// ---------------------------------------------------------------------
// ✅ بخش ۳: پینگ خودکار برای جلوگیری از Sleep در Render Free
// ---------------------------------------------------------------------
setInterval(async () => {
  try {
    // URL دامنه‌ی واقعی پروژه در Render
    const pingUrl = process.env.PING_URL || 'https://pargas-pakhsh.onrender.com/status'
    const res = await fetch(pingUrl)
    console.log('⏱️ Ping sent to Render:', res.status)
  } catch (err) {
    console.log('⚠️ Ping failed:', err.message)
  }
}, 9 * 60 * 1000) // هر ۹ دقیقه

// ---------------------------------------------------------------------
// ✅ بخش ۴: مسیرهای API پروژه (همان‌های موجود)
// ---------------------------------------------------------------------
const productRoutes = require('./routes/product.routes')
const orderRoutes = require('./routes/order.routes')
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

// ---------------------------------------------------------------------
// ✅ بخش ۵: اجرای سرور و اتصال MongoDB
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 3000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
  })

