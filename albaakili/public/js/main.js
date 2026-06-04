/* ═══════════════════════════════════════════════════════
   main.js — Shared utilities for Al-Baakili Hijab Store
   ═══════════════════════════════════════════════════════ */

// ─── Settings cache ──────────────────────────────────────
let siteSettings = null;

async function getSettings() {
  if (siteSettings) return siteSettings;
  try {
    const r = await fetch('/api/settings/public');
    siteSettings = await r.json();
  } catch { siteSettings = {}; }
  return siteSettings;
}

// ─── WhatsApp helper ──────────────────────────────────────
function whatsappUrl(productName = null, settings = null) {
  const wa = settings?.whatsapp || siteSettings?.whatsapp || '966500000000';
  let msg = 'السلام عليكم، ';
  if (productName) msg += `أرغب في الاستفسار عن المنتج: ${productName}`;
  else msg += 'أرغب في الاستفسار عن منتجاتكم.';
  return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
}

// ─── Theme ────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.querySelectorAll('#themeToggle').forEach(btn => {
    btn.innerHTML = saved === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.querySelectorAll('#themeToggle').forEach(btn => {
    btn.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
}

// ─── Wishlist ─────────────────────────────────────────────
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}
function toggleWishlist(id) {
  let list = getWishlist();
  const idx = list.indexOf(id);
  if (idx === -1) { list.push(id); showToast('تمت الإضافة إلى المفضلة ❤️'); }
  else { list.splice(idx, 1); showToast('تمت الإزالة من المفضلة'); }
  localStorage.setItem('wishlist', JSON.stringify(list));
  updateWishlistButtons();
  return list.includes(id);
}
function isWishlisted(id) { return getWishlist().includes(id); }
function updateWishlistButtons() {
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = btn.dataset.wishlistId;
    btn.classList.toggle('active', isWishlisted(id));
    btn.innerHTML = isWishlisted(id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  });
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── Header ───────────────────────────────────────────────
async function initHeader() {
  const settings = await getSettings();

  // Logo text
  document.querySelectorAll('.logo-text-main').forEach(el => el.textContent = settings.storeName || 'البعقيلي للحجاب');
  document.querySelectorAll('.logo-text-sub').forEach(el => el.textContent = 'Luxury Modest Fashion');

  // WhatsApp in header
  document.querySelectorAll('.header-whatsapp').forEach(el => {
    el.href = whatsappUrl(null, settings);
  });

  // Floating WhatsApp
  const floatBtn = document.getElementById('whatsappFloat');
  if (floatBtn) floatBtn.href = whatsappUrl(null, settings);

  // Scroll behavior
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 300);
  });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (ham && mobileMenu) {
    ham.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // Active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a, .mobile-menu nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === currentPath || (currentPath.startsWith(a.getAttribute('href') || '') && a.getAttribute('href') !== '/'));
  });
}

// ─── Product card renderer ────────────────────────────────
function renderProductCard(product, settings) {
  const wa = whatsappUrl(product.name, settings);
  const wishlisted = isWishlisted(product.id);
  const imgSrc = product.images?.[0] || '/assets/images/product-placeholder.jpg';
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <img src="${imgSrc}" alt="${product.name}" loading="lazy" onerror="this.src='/assets/images/product-placeholder.jpg'">
        ${product.featured ? '<span class="product-badge">مميز ✨</span>' : ''}
        <button class="product-wishlist ${wishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" onclick="toggleWishlist('${product.id}'); return false;">
          <i class="${wishlisted ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.shortDescription}</p>
        <div class="product-price">${product.price.toLocaleString('ar-SA')} ر.س <span>شامل الضريبة</span></div>
        <div class="product-actions">
          <a href="/product/${product.id}" class="btn btn-outline btn-sm">التفاصيل</a>
          <a href="${wa}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
            <i class="fab fa-whatsapp"></i> واتساب
          </a>
        </div>
      </div>
    </div>`;
}

// ─── Scroll top ───────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Init on DOMContentLoaded ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initScrollTop();
  updateWishlistButtons();

  document.querySelectorAll('#themeToggle').forEach(btn => btn.addEventListener('click', toggleTheme));
});
