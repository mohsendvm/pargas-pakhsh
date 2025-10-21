require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const logFile = path.join(__dirname, 'monitor.log');

// 📡 تابع مرکزی ثبت رویداد
function logEvent(eventType, message) {
  const time = new Date().toISOString();
  const entry = `[${time}] [${eventType}] ${message}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(entry);

  // فقط در رخداد بحرانی ایمیل هشدار بده
  if (eventType === 'FATAL' || eventType === 'REJECTION') {
    sendAlertEmail(eventType, message, time);
  }
}

// ✉️ تابع ارسال ایمیل هشدار
async function sendAlertEmail(eventType, message, time) {
  try {
    // ⚙️ تنظیم مطمئن برای اجرای در Render (TLS مستقیم)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // ← حالت SSL امن برای Gmail روی Cloud
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 20000, // زمان انتظار برای Render
      socketTimeout: 20000,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false, // جلوگیری از بسته شدن سرتیفیکیت TLS در Render
      },
    });

    // ⚠️ اصلاح بخش قالب HTML و header از نظر quotation
    const mailOptions = {
      from: `"Pargas Monitoring 👑" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECEIVER,
      subject: `🚨 [${eventType}] Alert from pargas-pakhsh`,
      html: `
        <div style="font-family:sans-serif; padding:10px;">
          <h2>🚨 System Alert: ${eventType}</h2>
          <p><b>Time:</b> ${time}</p>
          <p><b>Message:</b> ${message}</p>
          <hr>
          <p>📡 Server: <i>pargas-pakhsh.onrender.com</i></p>
          <p>🧩 MongoDB: ${global.mongoConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          <p>🧩 MSSQL: ${global.sqlConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📤 Alert Email sent to ${process.env.ALERT_RECEIVER}`);
  } catch (err) {
    console.error('❌ Error sending alert email:', err.message);
    logEvent('REJECTION', `Email sending failed: ${err.message}`);
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

// 🧪 تست دستی
setTimeout(() => {
  logEvent('FATAL', 'Manual test alert – Monitor.js execution confirmed.');
}, 3000);

module.exports = logEvent;

