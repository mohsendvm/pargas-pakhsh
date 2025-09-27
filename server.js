// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db.config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('Server is running and DB Connected!');
});

// Environment variables
const PORT = process.env.PORT || 3000;

// Connect DB and then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(🚀 Server running on port ${PORT});
  });
});