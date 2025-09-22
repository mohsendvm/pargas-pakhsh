const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/orders', (req, res) => {
  const ordersPath = path.join(__dirname, 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersPath)) {
    orders = JSON.parse(fs.readFileSync(ordersPath));
  }
  const order = { id: Date.now(), date: new Date(), items: req.body.items };
  orders.push(order);
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  res.json({ success: true, orderId: order.id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));