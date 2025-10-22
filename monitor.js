// 📦 Monitor.js نسخه HTTPS Production برای Render Cloud
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

    // فقط در رخداد بحرانی هشدار بده
    if (eventType === 'FATAL' || eventType === 'REJECTION') {
        sendAlert(eventType, message, time);
    }
}

// 🚨 تابع ارسال هشدار از طریق Formspree
async function sendAlert(eventType, message, time) {
    // 🧩 بررسی اولیه – وجود متغیر محیطی
    const endpoint = process.env.ALERT_ENDPOINT;
    if (!endpoint || !endpoint.startsWith('https://')) {
        const errMsg = '⚠️ ALERT_ENDPOINT missing or invalid!';
        console.error(errMsg);
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] [CONFIG] ${errMsg}\n`);
        return;
    }

    // 🧩 Payload آماده و تمیز
    const payload = {
        _subject: `🚨 [${eventType}] Alert from pargas-pakhsh`,
        message: `
            نوع رخداد: ${eventType}
            زمان: ${time}
            پیام: ${message}
            سرور: pargas-pakhsh.onrender.com
        `
    };

    // 🧱 لایه‌ی مقاومت شبکه‌ای (Retry هوشمند)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                timeout: 20000 // جلوگیری از Freeze در Render
            });

            if (response.ok) {
                console.log(`📤 Alert Email sent successfully via Formspree [Attempt ${attempt}]`);
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] [SUCCESS] Formspree OK\n`);
                return;
            } else {
                console.error(`❌ Formspree Error (${response.status}): ${response.statusText}`);
            }
        } catch (err) {
            console.error(`🔁 Attempt ${attempt} failed – ${err.message}`);
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] [RETRY-${attempt}] ${err.message}\n`);
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000)); // مکث بین تلاش‌ها
        }
    }

    // اگر هیچ تلاشی موفق نبود:
    console.error('❌ HTTPS Alert Failed after 3 retries.');
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] [FAIL] Formspree unreachable\n`);
}

// 🛡️ هندلرهای خطا
process.on('uncaughtException', err => {
    logEvent('FATAL', `❌ Uncaught Exception: ${err.message}`);
    console.error(err.stack);
});

process.on('unhandledRejection', reason => {
    logEvent('REJECTION', `⚠️ Unhandled Rejection: ${reason}`);
});

// 🚦 درج وضعیت فعال سیستم در لاگ هنگام استارت
console.log(`✅ Render Formspree Relay Active [${new Date().toISOString()}]`);

// 🧪 تست اولیه دستی
setTimeout(() => {
    logEvent('FATAL', 'Manual test alert – Monitor.js HTTPS confirmed.');
}, 3000);

module.exports = logEvent;

