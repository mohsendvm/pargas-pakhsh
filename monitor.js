const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'monitor.log');

function logEvent(eventType, message) {
  const time = new Date().toISOString();
  const entry = `[${time}] [${eventType}] ${message}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(entry);
}

// نمونه استفاده‌ها:
logEvent('SYSTEM', 'Monitoring started');
process.on('uncaughtException', err => logEvent('FATAL', err.message));
process.on('unhandledRejection', err => logEvent('REJECTION', err.message));

module.exports = logEvent;

