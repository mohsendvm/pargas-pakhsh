const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ordersFile = path.join(__dirname, 'orders.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/orders', (req, res) => {
    const newOrder = {
        orderId: Date.now(),
        date: new Date().toISOString(),
        items: req.body,
    };

    let orders = [];
    if (fs.existsSync(ordersFile)) {
        try {
            orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
            if (!Array.isArray(orders)) orders = [];
        } catch (err) {
            orders = [];
        }
    }

    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json({ status: 'success', message: 'Order received' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

