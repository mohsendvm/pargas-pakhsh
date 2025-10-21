// ✅ بارگذاری متغیرهای محیطی
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // ← جایگزین nodemailer

// محل ذخیره لاگ‌ها
const logFile = path.join(__dirname, 'monitor.log');

// 📡 تابع ثبت رویداد مرکزی
function logEvent(eventType, message) {
  const time = new Date().toISOString();
  const entry = `[${time}] [${eventType}] ${message}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(entry);

  // در رخداد بحرانی ایمیل بفرست
  if (eventType === 'FATAL' || eventType === 'REJECTION') {
    sendAlertEmail(eventType, message, time);
  }
}

// ✉️ تابع ارسال هشدار از طریق HTTPS Formspree
async function sendAlertEmail(eventType, message, time) {
  try {
    // آدرس فرم Formspree شخصی — در مرحله بعد خواهیم ساخت 👇
    const FORM_ENDPOINT = process.env.ALERT_ENDPOINT;

    const payload = {
      email: process.env.ALERT_RECEIVER,
      subject: `🚨 [${eventType}] Pargas Alert`,
      message: `
        <div style="font-family:sans-serif;">
          <h2>🚨 System Alert: ${eventType}</h2>
          <p><b>Time:</b> ${time}</p>
          <p><b>Message:</b> ${message}</p>
          <hr>
          <p>📡 Render Server: pargas-pakhsh.onrender.com</p>
          <p>🧩 MongoDB: ${global.mongoConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          <p>🧩 MSSQL: ${global.sqlConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>
      `,
    };

    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`📤 Alert Email sent successfully via Formspree`);
    } else {
      console.error(`❌ Formspree response not OK: ${res.statusText}`);
    }
  } catch (err) {
    console.error('❌ Fetch error sending alert:', err.message);
  }
}

// 🛡️ هندلرهای خطاهای سیستم
process.on('uncaughtException', (err) => {
  logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  logEvent('REJECTION', `⚠️ Unhandled Rejection: ${reason}`);
});

// 🧪 تست
setTimeout(() => {
  logEvent('FATAL', 'Manual test alert – Monitor.js execution confirmed.');
}, 3000);

module.exports = logEvent;

