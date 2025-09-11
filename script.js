fetch('./products.json')
  .then(res => res.json())
  .then(data => {
    const catalog = document.getElementById('catalog');
    data.forEach(brand => {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'brand';
      brandDiv.style.borderColor = brand.color;
      brandDiv.innerHTML = `<h3>${brand.name}</h3>`;
      brand.products.forEach(prod => {
        const btn = document.createElement('button');
        btn.textContent = `${prod.name} - ${prod.price} تومان`;
        btn.onclick = () => addToCart(brand.name, prod);
        brandDiv.appendChild(btn);
      });
      catalog.appendChild(brandDiv);
    });
  });

const cart = {};
function addToCart(brandName, product) {
  if(!cart[brandName]) cart[brandName] = [];
  cart[brandName].push(product);
  renderCart();
}

function renderCart(){
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  let total = 0;
  for(const brand in cart){
    const liBrand = document.createElement('li');
    liBrand.textContent = brand;
    cartItems.appendChild(liBrand);
    cart[brand].forEach(prod => {
      const li = document.createElement('li');
      li.textContent = `${prod.name} - ${prod.price} تومان`;
      cartItems.appendChild(li);
      total += prod.price;
    });
  }
  document.getElementById('total').textContent = `مجموع: ${total} تومان`;
}