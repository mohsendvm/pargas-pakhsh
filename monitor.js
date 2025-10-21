   // 📦 فایل monitor.js نسخه HTTPS پایدار برای Render Cloud
   require('dotenv').config();
   const fs = require('fs');
   const path = require('path');
   const fetch = require('node-fetch');

   const logFile = path.join(__dirname, 'monitor.log');

   // 🧭 تابع ثبت رویدادها
   function logEvent(eventType, message) {
       const time = new Date().toISOString();
       const entry = `[${time}] [${eventType}] ${message}\n`;

       fs.appendFileSync(logFile, entry);
       console.log(entry);

       // فقط در رخداد بحرانی بفرست هشدار
       if (eventType === 'FATAL' || eventType === 'REJECTION') {
           sendAlert(eventType, message, time);
       }
   }

   // 🚨 تابع ارسال هشدار از طریق Formspree
   async function sendAlert(eventType, message, time) {
       try {
           const response = await fetch(process.env.ALERT_ENDPOINT, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   _subject: `🚨 [${eventType}] Alert from pargas-pakhsh`,
                   message: `
                       نوع رخداد: ${eventType}
                       زمان: ${time}
                       پیام: ${message}
                       سرور: pargas-pakhsh.onrender.com
                   `
               })
           });

           if (response.ok) {
               console.log('📤 Alert Email sent successfully via Formspree');
           } else {
               console.error(`❌ Formspree Error (${response.status}): ${response.statusText}`);
           }
       } catch (err) {
           console.error('❌ HTTPS Alert Failed:', err.message);
           fs.appendFileSync(logFile, `[${new Date().toISOString()}] [FAIL] ${err.message}\n`);
       }
   }

   // 🛡️ هندلرهای خطا
   process.on('uncaughtException', err => {
       logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
   });

   process.on('unhandledRejection', reason => {
       logEvent('REJECTION', `⚠️ Unhandled Rejection: ${reason}`);
   });

   // 🧪 تست اولیه
   setTimeout(() => {
       logEvent('FATAL', 'Manual test alert – Monitor.js HTTPS confirmed.');
   }, 3000);

   module.exports = logEvent;

