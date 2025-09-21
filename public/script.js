// لود برندها
fetch('brands.json')
  .then(r => r.json())
  .then(brands => {
    console.log('Brands:', brands);
    const html = brands.map(b =>
      `<button onclick="loadProducts('${b.id}')">${b.name}</button>`
    ).join('');
    document.getElementById('brand-list').innerHTML = html;
  });

// لود محصولات مربوط به هر برند
function loadProducts(brandId) {
  fetch(`products/${brandId}.json`)
    .then(r => r.json())
    .then(products => {
      console.log(`Products for ${brandId}:`, products);
      const html = products.map(p =>
        `<div>
           <strong>${p.name}</strong> - ${p.price} تومان
           <button onclick="showCode('${p.code}')">نمایش کد</button>
         </div>`
      ).join('');
      document.getElementById('product-list').innerHTML = html;
      document.getElementById('code-list').innerHTML = ''; // خالی کردن کدها
    });
}

// نمایش کد محصول
function showCode(code) {
  document.getElementById('code-list').innerHTML =
    `<div><strong>کد محصول:</strong> ${code}</div>`;
}
