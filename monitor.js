// --------------------------------------------------------
// ✅ monitor.js — نسخه نهایی HTTPS + ESM برای مرحله Production
// --------------------------------------------------------
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const logFile = path.join(process.cwd(), 'monitor.log');

// 🧭 ثبت رویدادها (هوشمند و سطح‌دار)
export function logEvent(eventType, message) {
  const time = new Date().toISOString();
  const entry = `[${time}] [${eventType}] ${message}\n`;
  fs.appendFileSync(logFile, entry, 'utf8');
  console.log(entry.trim());

  // رخداد حیاتی → هشدار HTTPS
  if (['FATAL', 'REJECTION', 'SECURITY'].includes(eventType)) {
    sendAlert(eventType, message, time);
  }
}

// 🚨 تابع ارسال هشدار به Formspree یا وب‌هوک سفارشی
export async function sendAlert(eventType, message, time) {
  const endpoint = process.env.ALERT_ENDPOINT;

  if (!endpoint || !endpoint.startsWith('https://')) {
    const errMsg = '⚠️ ALERT_ENDPOINT missing or invalid!';
    fs.appendFileSync(
      logFile,
      `[${new Date().toISOString()}] [CONFIG] ${errMsg}\n`,
      'utf8'
    );
    console.error(errMsg);
    return;
  }

  const payload = {
    _subject: `🚨 [${eventType}] Alert from Pargas-Pakhsh`,
    message: `
نوع رخداد: ${eventType}
زمان: ${time}
پیام: ${message}
سرور: pargas-pakhsh.onrender.com
    `,
  };

  // تلاش با حداکثر ۳ Retry در ۴۵ ثانیه
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] [SUCCESS] Formspree OK\n`,
          'utf8'
        );
        console.log(`📤 Alert Email sent via Formspree (try ${attempt})`);
        return;
      } else {
        console.error(`❌ Formspree Error (${response.status})`);
      }
    } catch (err) {
      fs.appendFileSync(
        logFile,
        `[${new Date().toISOString()}] [RETRY-${attempt}] ${err.message}\n`,
        'utf8'
      );
      console.error(`🔁 Attempt ${attempt} failed: ${err.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }

  fs.appendFileSync(
    logFile,
    `[${new Date().toISOString()}] [FAIL] Formspree unreachable\n`,
    'utf8'
  );
  console.error('❌ HTTPS Alert Failed after 3 retries.');
}

// 🛡️ ثبت خطاهای global برای اطمینان از محیط Production:
process.on('uncaughtException', err => {
  logEvent('FATAL', `Uncaught Exception: ${err.message}`);
});
process.on('unhandledRejection', reason => {
  logEvent('REJECTION', `Unhandled Promise Rejection: ${reason}`);
});
console.log('🧠 Monitor.js فعال شد (HTTPS Alert Mode)');

