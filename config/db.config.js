const mongoose = require('mongoose');
require('dotenv').config(); // برای خواندن MONGO_URI از .env در حالت محلی

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('🟢 MongoDB Atlas Connected...');
  } catch (err) {
    console.error(`🔴 MongoDB Connection Error: ${err.message}`);
    process.exit(1); // توقف برنامه اگر اتصال برقرار نشد
  }
};

module.exports = connectDB;

