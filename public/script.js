// نمایش لیست برندها
async function loadBrands() {
  try {
    const res = await fetch('brands.json');
    const brands = await res.json();

    const brandList = document.getElementById('brand-list');
    brandList.innerHTML = '';

    brands.forEach(brand => {
      const btn = document.createElement('button');
      btn.textContent = brand.name;
      btn.onclick = () => loadProducts(brand.id);
      brandList.appendChild(btn);
    });
  } catch (err) {
    console.error('خطا در لود برندها:', err);
  }
}

// نمایش محصولات بر اساس برند
async function loadProducts(brandId) {
  try {
    const res = await fetch(`products/${brandId}.json`); // ← اصلاح شده
    const products = await res.json();

    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}" />
        <h3>${prod.name}</h3>
        <p>${prod.price} تومان</p>
        <button onclick="addToCart('${prod.id}')">افزودن به سبد</button>
        <button onclick="loadCodes('${prod.id}')">کدها</button>
      `;
      productList.appendChild(div);
    });
  } catch (err) {
    console.error(`خطا در لود محصولات برند ${brandId}:`, err);
  }
}

// نمایش کدهای محصول
async function loadCodes(prodId) {
  try {
    const res = await fetch(`codes/${prodId}.json`); // ← اصلاح شده
    const data = await res.json();

    alert(`کد این محصول: ${data.code}`);
  } catch (err) {
    console.error(`خطا در لود کد محصول ${prodId}:`, err);
  }
}

// افزودن محصول به سبد خرید
function addToCart(prodId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(prodId);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// نمایش سبد خرید
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = '';

  cart.forEach(id => {
    const li = document.createElement('li');
    li.textContent = id;
    cartList.appendChild(li);
  });
}

// شروع برنامه
document.addEventListener('DOMContentLoaded', () => {
  loadBrands();
  renderCart();
});
