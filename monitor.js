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

  if (eventType === 'FATAL' || eventType === 'REJECTION') {
    sendAlertEmail(eventType, message, time);
  }
}

// ✉️ تابع ارسال ایمیل هشدار
async function sendAlertEmail(eventType, message, time) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // SSL بسته است → TLS فعال
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 60000,
      socketTimeout: 60000,
      tls: {
        ciphers: 'TLSv1.2',
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Pargas Monitoring 👑" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECEIVER,
      subject: `🚨 [${eventType}] Alert from pargas-pakhsh`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>🚨 System Alert: ${eventType}</h2>
          <p><b>Time:</b> ${time}</p>
          <p><b>Message:</b> ${message}</p>
          <hr>
          <p>📡 Server: pargas-pakhsh.onrender.com</p>
          <p>🧩 MongoDB: ${global.mongoConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          <p>🧩 MSSQL: ${global.sqlConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📤 Alert Email sent to ${process.env.ALERT_RECEIVER}`);
  } catch (err) {
    console.error('❌ Error sending alert email:', err.message);
  }
}

// 🔗 هندلرهای خطاهای سیستم
process.on('uncaughtException', (err) => {
  logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  logEvent('REJECTION', `⚠️ Unhandled Rejection: ${err.message}`);
});

// 🧪 تست دستی
setTimeout(() => {
  logEvent('FATAL', 'Manual test alert – Monitor.js execution confirmed.');
}, 3000);

module.exports = logEvent;

