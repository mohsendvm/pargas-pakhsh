// ----- Navbar بالای داشبورد -----
export function renderNavbar(userName = 'شاه‌محسن 👑') {
  return `
    <nav class="navbar">
      <div class="logo">پارگاس پخش کارمد</div>
      <div class="menu">
        <span>خوش آمدی، ${userName}</span>
        <a href="/logout">خروج</a>
      </div>
    </nav>
  `;
}

