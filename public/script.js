let cart = [];

// لود برندها
fetch('brands.json')
  .then(r => r.json())
  .then(brands => {
    const html = brands.map(b =>
      `<button onclick="loadProducts('${b.id}')">${b.name}</button>`
    ).join('');
    document.getElementById('brand-list').innerHTML = html;
  });

// لود محصولات هر برند
function loadProducts(brandId) {
  fetch(`products/${brandId}.json`)
    .then(r => r.json())
    .then(products => {
      const html = products.map(p =>
        `<div>
           <strong>${p.name}</strong><br>
           قیمت: ${p.price} تومان<br>
           <button onclick="addToCart('${p.id}','${p.name}',${p.price})">افزودن به سبد</button>
         </div>`
      ).join('');
      document.getElementById('product-list').innerHTML = html;
      document.getElementById('code-list').innerHTML = '';
    });
}

// اضافه کردن به سبد
function addToCart(id, name, price) {
  const item = cart.find(p => p.id === id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

// نمایش سبد خرید
function renderCart() {
  if (cart.length === 0) {
    document.getElementById('cart-list').innerHTML = '<em>سبد خرید خالی است</em>';
    return;
  }
  const html = cart.map(item =>
    `<div>
       ${item.name} - ${item.price} تومان × ${item.qty}
       <button onclick="changeQty('${item.id}', 1)">+</button>
       <button onclick="changeQty('${item.id}', -1)">-</button>
       <button onclick="removeFromCart('${item.id}')">حذف</button>
     </div>`
  ).join('');

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  document.getElementById('cart-list').innerHTML = html + `
    <hr>مجموع: ${total} تومان
    <br><button onclick="sendOrder()">ثبت سفارش</button>
  `;
}

// تغییر تعداد
function changeQty(id, delta) {
  const item = cart.find(p => p.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(p => p.id !== id);
    }
    renderCart();
  }
}

// حذف کردن از سبد خرید
function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  renderCart();
}

// ارسال سفارش به سرور
function sendOrder() {
  if (cart.length === 0) {
    alert('سبد خرید شما خالی است.');
    return;
  }

  fetch('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        alert(`سفارش ثبت شد. شماره سفارش: ${data.orderId}`);
        cart = [];
        renderCart();
      } else {
        alert('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.');
      }
    })
    .catch(err => {
      console.error('خطا:', err);
      alert('امکان اتصال به سرور وجود ندارد.');
    });
}
