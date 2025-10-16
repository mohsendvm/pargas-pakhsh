<<<<<<< HEAD
require('dotenv').config();
const fetch = require('node-fetch');

async function testPing() {
  try {
    const res = await fetch(process.env.PING_URL);
    console.log('✅ Ping OK:', res.status);
  } catch (err) {
    console.error('❌ Ping failed:', err.message);
  }
}

testPing();
setInterval(testPing, 9 * 60 * 1000);

=======
require('dotenv').config();
const fetch = require('node-fetch');

async function testPing() {
  try {
    const res = await fetch(process.env.PING_URL);
    console.log('✅ Ping OK:', res.status);
  } catch (err) {
    console.error('❌ Ping failed:', err.message);
  }
}

testPing();
setInterval(testPing, 9 * 60 * 1000);

>>>>>>> 8afd6862d69991219988e55d2c13f37d6b125136
