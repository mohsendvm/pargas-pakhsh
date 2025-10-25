// ----- Navbar بالای داشبورد -----
export function renderNavbar(userName = '‌محسن') {
  return `
    <nav class="navbar">
      <div class="logo">پرگاس پخش کارمد</div>
      <div class="menu">
        <span>خوش آمدی، ${userName}</span>
        <a href="/logout">خروج</a>
      </div>
    </nav>
  `;
}


