const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/orders', (req,res)=>{
  const order = {orderId: Date.now(), date: new Date().toISOString(), items:req.body.items};
  fs.appendFileSync('orders.json', JSON.stringify(order)+'
');
  res.json({status:'ok', message:'Order received'});
});

app.listen(3000, ()=>console.log('Server running on port 3000'));