let products = [], cart = [];
fetch('products.json')
  .then(res => res.json())
  .then(data => {products = data; renderProducts(data);});

function renderProducts(list){
  const container = document.getElementById('productList');
  container.innerHTML = '';
  list.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3';
    col.innerHTML = `
      <div class='card h-100'>
        <img src='${p.image}' class='card-img-top'>
        <div class='card-body d-flex flex-column'>
          <h5 class='card-title'>${p.name}</h5>
          <p class='card-text'>${p.price.toLocaleString()} تومان</p>
          <input type='number' min='1' value='1' class='form-control mb-2' id='qty-${p.id}'>
          <button class='btn btn-outline-success mt-auto' onclick='addToCart(${p.id})'>افزودن به سبد</button>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

function addToCart(id){
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const prod = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if(existing) { existing.qty += qty; }
  else { cart.push({...prod, qty: qty}); }
  updateCart();
}

function updateCart(){
  document.getElementById('cartCount').innerText = cart.reduce((a,c)=>a+c.qty,0);
  document.getElementById('cartTotal').innerText = cart.reduce((a,c)=>a+c.price*c.qty,0).toLocaleString();
  const tbody = document.getElementById('cartItems');
  tbody.innerHTML = '';
  cart.forEach(c => {
    tbody.innerHTML += `<tr><td>${c.name}</td><td>${c.price.toLocaleString()}</td><td>${c.qty}</td><td>${(c.price*c.qty).toLocaleString()}</td></tr>`;
  });
  const msg = cart.map(c => `${c.name} x ${c.qty}`).join('%0A');
  document.getElementById('whatsappOrder').href = `https://wa.me/989123456789?text=${msg}`;
  document.getElementById('rubikaOrder').href = `https://rubika.ir/yourchannel?msg=${msg}`;
}

document.getElementById('cartFloating').addEventListener('click', ()=>{
  new bootstrap.Modal(document.getElementById('cartModal')).show();
});

document.getElementById('searchInput').addEventListener('input', e=>{
  const keyword = e.target.value.trim();
  const filtered = products.filter(p => p.name.includes(keyword));
  renderProducts(filtered);
});
