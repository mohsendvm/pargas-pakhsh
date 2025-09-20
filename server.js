const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/orders', (req, res) => {
    const order = req.body;
    console.log('سفارش دریافت شد:', order);
    res.json({status: 'ok'});
});
app.listen(3000, () => console.log('Server running on port 3000'));