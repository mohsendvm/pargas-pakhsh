const sql = require('mssql');

const config = {
  user: 'sepidarapi',
  password: '86468646',
  server: '192.168.1.100',
  database: 'Sepidar02',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    }
  }
};

async function connectSepidar() {
  try {
    await sql.connect(config);
    console.log("✅ اتصال MSSQL سپیدار برقرار شد!");
  } catch (err) {
    console.error("❌ خطا در اتصال MSSQL سپیدار:", err);
  }
}

connectSepidar();

