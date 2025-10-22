// 📦 Monitor.js نسخه HTTPS Production برای Render Cloud
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cron = require('node-cron'); // برای زمان‌بندی چرخش لاگ‌ها

const logFile = path.join(__dirname, 'monitor.log');

// 🧭 تابع ثبت رویدادها
function logEvent(eventType, message) {
    const time = new Date().toISOString();
    const entry = `[${time}] [${eventType}] ${message}\n`;

    fs.appendFileSync(logFile, entry);
    console.log(entry);

    // فقط در رخدادهای بحرانی هشدار بده
    if (eventType === 'FATAL' || eventType === 'REJECTION') {
        sendAlert(eventType, message, time);
    }
}

// 🚨 تابع ارسال هشدار از طریق Formspree
async function sendAlert(eventType, message, time) {
    const endpoint = process.env.ALERT_ENDPOINT;

    // 🧩 بررسی اولیه – صحت متغیر محیطی
    if (!endpoint || !endpoint.startsWith('https://')) {
        const errMsg = '⚠️ ALERT_ENDPOINT missing or invalid!';
        console.error(errMsg);
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] [CONFIG] ${errMsg}\n`);
        return;
    }

    // 📤 Payload ساخت‌یافته برای ارسال به Formspree
    const payload = {
        _subject: `🚨 [${eventType}] Alert from pargas-pakhsh`,
        message: `
        نوع رخداد: ${eventType}
        زمان: ${time}
        پیام: ${message}
        سرور: pargas-pakhsh.onrender.com
        `
    };

    // 🧱 تلاش‌های چندمرحله‌ای (Retry تا 3 بار)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeout);

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
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }
    }

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

// ♻️ زمان‌بندی برای چرخش لاگ‌ها هر شب 23:59 UTC
cron.schedule('59 23 * * *', () => {
    const dateTag = new Date().toISOString().split('T')[0];
    const archiveDir = path.join(__dirname, 'logs');
    const archivePath = path.join(archiveDir, `archive-${dateTag}.log`);

    // اطمینان از وجود پوشه logs
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir);
    }

    if (fs.existsSync(logFile)) {
        fs.renameSync(logFile, archivePath);
        fs.writeFileSync(logFile, `🧩 Log reset at midnight (${dateTag})\n`);
        console.log(`♻️ Log rotated → ${archivePath}`);
    }
});

// 🚦 وضعیت شروع سیستم در لاگ و کنسول
console.log(`✅ Render Formspree Relay Active [${new Date().toISOString()}]`);
fs.appendFileSync(logFile, `[${new Date().toISOString()}] [INIT] Formspree Relay Active\n`);

// 🧪 تست اولیه دستی در Boot
setTimeout(() => {
    logEvent('FATAL', 'Manual test alert – Monitor.js HTTPS confirmed.');
}, 3000);

module.exports = logEvent;

