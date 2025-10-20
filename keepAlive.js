// keepAlive.js
require('dotenv').config();
const fetch = require('node-fetch');

// 🌐 تابع تست پینگ به سرور Render یا دامنه لوکال
async function testPing() {
  try {
    const res = await fetch(process.env.PING_URL);
    console.log('✅ Ping OK:', res.status);
  } catch (err) {
    console.error('❌ Ping failed:', err.message);
  }
}

// 🚀 اجرای اولین پینگ + تکرار دوره‌ای هر 9 دقیقه
testPing();
setInterval(testPing, 9 * 60 * 1000);

