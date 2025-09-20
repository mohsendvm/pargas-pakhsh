document.addEventListener('DOMContentLoaded', () => {
    fetch('products.json')
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('products-container');
            if (!container) return;
            container.innerHTML = '';
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="products/${p.image}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>${p.price} تومان</p>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => console.error('خطا در لود محصولات:', err));

    fetch('customers.json')
        .then(res => res.json())
        .then(customers => {
            const container = document.getElementById('customers-container');
            if (!container) return;
            container.innerHTML = '';
            customers.forEach(c => {
                const row = document.createElement('div');
                row.className = 'customer-row';
                row.innerHTML = `
                    <strong>${c.name}</strong> — ${c.city}
                `;
                container.appendChild(row);
            });
        })
        .catch(err => console.error('خطا در لود مشتری‌ها:', err));
});