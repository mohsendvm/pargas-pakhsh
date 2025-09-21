const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // برای خواندن JSON از POST
app.use(express.static(path.join(__dirname, 'public')));

// مسیر دریافت سفارش از فرانت
app.post('/orders', (req, res) => {
    const order = req.body;
    console.log('سفارش دریافت شد:', order);

    // تولید شماره سفارش ساده
    const orderId = Date.now();

    // ذخیره‌سازی سفارش‌ها در یک فایل (اختیاری)
    const ordersFile = path.join(__dirname, 'orders.json');
    let existing = [];
    if (fs.existsSync(ordersFile)) {
        existing = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    }
    existing.push({ id: orderId, ...order });
    fs.writeFileSync(ordersFile, JSON.stringify(existing, null, 2));

    res.json({ status: 'ok', orderId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
