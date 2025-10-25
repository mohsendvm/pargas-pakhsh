// ----- Sidebar برای داشبورد -----
const links = [
  { name: 'داشبورد', path: '/admin/dashboard' },
  { name: 'محصولات', path: '/admin/products' },
  { name: 'سفارش‌ها', path: '/admin/orders' },
  { name: 'امور مالی', path: '/admin/finance' },
  { name: 'کمپین‌ها', path: '/admin/campaigns' },
  { name: 'گزارشات', path: '/admin/analytics' },
];

export function renderSidebar() {
  let html = '<ul class="sidebar">';
  links.forEach(link => {
    html += `<li><a href="${link.path}">${link.name}</a></li>`;
  });
  html += '</ul>';
  return html;
}

