const sql = require('mssql')

let pool = null // حافظه‌ی اتصال فعال

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
    enableArithAbort: true
  }
}

async function connectToSQL() {
  try {
    if (pool) await pool.connect()
    else pool = await sql.connect(config)

    console.log('✅ MSSQL سپیدار متصل شد')
    global.sqlConnected = true
    return pool
  } catch (err) {
    console.error('⚠️ خطا در اتصال MSSQL:', err.message)
    global.sqlConnected = false
    // تلاش دوباره بعد ۵ ثانیه
    setTimeout(connectToSQL, 5000)
  }
}

module.exports = { connectToSQL, sql }

