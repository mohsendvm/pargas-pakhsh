document.addEventListener("DOMContentLoaded", () => {
    const brandList = document.getElementById("brand-list");
    const productList = document.getElementById("product-list");
    const cartButton = document.getElementById("cart-button");
    const cartPanel = document.getElementById("cart-panel");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const closeCartBtn = document.getElementById("close-cart");
    const recommendationsContainer = document.getElementById("recommendations");

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // =================== برندها ===================
    fetch("brands.json")
        .then(res => res.json())
        .then(brands => {
            brandList.innerHTML = "";
            brands.forEach(brand => {
                const div = document.createElement("div");
                div.className = "brand-card";
                div.innerHTML = `
                    <img src="${brand.logo}" alt="${brand.name}" style="max-width:100px">
                    <h3>${brand.name}</h3>
                `;
                div.onclick = () => loadProducts(brand.id);
                brandList.appendChild(div);
            });
        });

    // =================== محصولات ===================
    function loadProducts(brandId) {
        fetch(`products/brand${brandId}.json`)
            .then(res => res.json())
            .then(products => {
                productList.innerHTML = "";
                products.forEach(prod => {
                    const div = document.createElement("div");
                    div.className = "product-card";
                    div.innerHTML = `
                        <img src="${prod.image}" alt="${prod.name}">
                        <h4>${prod.name}</h4>
                        <p>${prod.price} تومان</p>
                        <button class="buy-btn">افزودن به سبد</button>
                    `;
                    div.querySelector(".buy-btn").onclick = () => {
                        if (prod.hasVariants) {
                            loadProductVariants(brandId, prod.id);
                        } else {
                            addToCart({ ...prod, qty: 1 });
                        }
                    };
                    div.onclick = (e) => {
                        if (!e.target.classList.contains("buy-btn")) {
                            showRecommendations(prod.id);
                        }
                    };
                    productList.appendChild(div);
                });
            });
    }

    // =================== لود کدها ===================
    function loadProductVariants(brandId, productId) {
        fetch(`codes/brand${brandId}_b${brandId}p${productId}.json`)
            .then(res => res.json())
            .then(codes => {
                const popup = document.createElement("div");
                popup.className = "popup";
                popup.innerHTML = `
                    <div class="popup-content">
                        <h3>انتخاب تنوع کالا</h3>
                        ${codes.map(code =>
                            `<div class="variant" data-code-id="${code.id}">
                                <span>${code.name}</span> - 
                                <strong>${code.price} تومان</strong>
                             </div>`
                        ).join("")}
                        <button id="close-popup">بستن</button>
                    </div>
                `;
                document.body.appendChild(popup);
                popup.querySelectorAll(".variant").forEach(v => {
                    v.onclick = () => {
                        const id = v.getAttribute("data-code-id");
                        const selected = codes.find(c => c.id == id);
                        addToCart({ ...selected, qty: 1 });
                        popup.remove();
                    };
                });
                document.getElementById("close-popup").onclick = () => popup.remove();
            });
    }

    // =================== افزودن به سبد خرید ===================
    function addToCart(item) {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            existing.qty += item.qty;
        } else {
            cart.push(item);
        }
        saveCart();
        renderCart();
    }

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // =================== نمایش سبد خرید ===================
    function renderCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
                <span>${item.name}</span>
                <input type="number" min="1" value="${item.qty}" class="qty-input">
                <span>${item.price * item.qty} تومان</span>
                <button class="remove-btn">×</button>
            `;
            // تغییر تعداد
            row.querySelector(".qty-input").onchange = (e) => {
                const newQty = parseInt(e.target.value);
                if (newQty > 0) {
                    item.qty = newQty;
                } else {
                    cart = cart.filter(c => c.id !== item.id);
                }
                saveCart();
                renderCart();
            };
            // حذف
            row.querySelector(".remove-btn").onclick = () => {
                cart = cart.filter(c => c.id !== item.id);
                saveCart();
                renderCart();
            };
            cartItemsContainer.appendChild(row);
            total += item.price * item.qty;
        });
        cartTotal.textContent = `${total} تومان`;
    }

    // =================== پیشنهادات کالا ===================
    function showRecommendations(productId) {
        fetch("recommendations.json")
            .then(res => res.json())
            .then(data => {
                const recs = data[productId] || [];
                recommendationsContainer.innerHTML = "";
                recs.forEach(r => {
                    const recDiv = document.createElement("div");
                    recDiv.className = "recommend-card";
                    recDiv.innerHTML = `
                        <img src="${r.image}" alt="${r.name}">
                        <h5>${r.name}</h5>
                        <p>${r.price} تومان</p>
                    `;
                    recDiv.onclick = () => addToCart({ ...r, qty: 1 });
                    recommendationsContainer.appendChild(recDiv);
                });
            });
    }

    // =================== رویدادهای سبد خرید ===================
    cartButton.onclick = () => {
        cartPanel.classList.add("open");
        renderCart();
    };
    closeCartBtn.onclick = () => cartPanel.classList.remove("open");

    // رندر اولیه
    renderCart();
});

