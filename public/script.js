let cart = [];

function loadBrands(){
 fetch('brands.json').then(r=>r.json()).then(data=>{
  const view=document.getElementById('view-section');
  view.innerHTML='';
  data.forEach(brand=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<img src="${brand.image}" alt="${brand.name}"><h3>${brand.name}</h3><button onclick="loadProducts('${brand.id}')">مشاهده محصولات</button>`;
    view.appendChild(div);
  });
 });
}

function loadProducts(brandId){
 fetch(`products/${brandId}.json`).then(r=>r.json()).then(data=>{
  const view=document.getElementById('view-section');
  view.innerHTML='<button onclick="loadBrands()">⬅ بازگشت</button>';
  data.forEach(prod=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<img src="${prod.image}" alt="${prod.name}"><h3>${prod.name}</h3>`;
    if(prod.hasCodes){
      div.innerHTML+=`<button onclick="loadCodes('${prod.id}')">انتخاب کدها</button>`;
    } else {
      div.innerHTML+=`<input type='number' min='1' value='1' id='qty_${prod.id}'><button onclick="addToCartDirect('${prod.id}','${prod.name}',1,${prod.price})">افزودن</button>`;
    }
    view.appendChild(div);
  });
 });
}

function loadCodes(prodId, page=1){
 fetch(`codes/${prodId}.json`).then(r=>r.json()).then(data=>{
  const perPage=6;
  const start=(page-1)*perPage;
  const codesPage=data.slice(start,start+perPage);
  const view=document.getElementById('view-section');
  view.innerHTML='<button onclick="loadProducts(''+prodId.split('_')[0]+'')">⬅ بازگشت</button>';
  codesPage.forEach(code=>{
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<h4>${code.code}</h4><input type='number' min='0' value='0' id='qty_code_${code.code}'><button onclick='addCodeToCart("${code.code}","${code.name}",${code.price})'>افزودن</button>`;
    view.appendChild(div);
  });
  let pagination='<div>';
  for(let i=1;i<=Math.ceil(data.length/perPage);i++){
    pagination+=`<button onclick="loadCodes('${prodId}',${i})">${i}</button>`;
  }
  pagination+='</div>';
  view.innerHTML+=pagination;
 });
}

function addCodeToCart(code,name,price){
  const qty=parseInt(document.getElementById('qty_code_'+code).value);
  if(qty>0){
    const existing=cart.find(i=>i.code===code);
    if(existing){existing.qty+=qty;}else{cart.push({code,name,qty,price});}
    renderCart();
  }
}

function addToCartDirect(id,name,qty,price){
  qty=parseInt(document.getElementById('qty_'+id).value);
  if(qty>0){
    const existing=cart.find(i=>i.code===id);
    if(existing){existing.qty+=qty;}else{cart.push({code:id,name,qty,price});}
    renderCart();
  }
}

function removeFromCart(code){
  cart=cart.filter(i=>i.code!==code);
  renderCart();
}

function renderCart(){
  const list=document.getElementById('cart-list');
  list.innerHTML='';
  cart.forEach(item=>{
    const li=document.createElement('li');
    li.innerHTML=`${item.name} (${item.qty}) <button onclick="removeFromCart('${item.code}')">❌</button>`;
    list.appendChild(li);
  });
}

document.getElementById('checkout-btn').onclick=()=>{
  alert('سفارش ثبت شد');
  cart=[];renderCart();
}

loadBrands();