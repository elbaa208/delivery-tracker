/* ═══════════════════════════════════════════
   products.js — Products listing page
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await getSettings();
  let allProducts = [];
  let allCategories = [];
  let currentPage = 1;
  const perPage = 9;

  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const sortSelect = document.getElementById('sortSelect');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resultsCount = document.getElementById('resultsCount');
  const paginationEl = document.getElementById('pagination');

  // Load data
  async function loadData() {
    grid.innerHTML = '<div class="loading"><div class="spinner"></div> جاري التحميل...</div>';
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      allProducts = await pRes.json();
      allCategories = await cRes.json();
      populateCategoryFilter();
      renderPage();
    } catch {
      grid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>حدث خطأ في تحميل المنتجات</p></div>';
    }
  }

  function populateCategoryFilter() {
    if (!categoryFilter) return;
    categoryFilter.innerHTML = '<option value="">جميع التصنيفات</option>';
    allCategories.forEach(c => {
      categoryFilter.innerHTML += `<option value="${c.slug}">${c.icon} ${c.name}</option>`;
    });
  }

  function getFiltered() {
    let products = [...allProducts];
    const search = searchInput?.value.toLowerCase() || '';
    const category = categoryFilter?.value || '';
    const min = +priceMin?.value || 0;
    const max = +priceMax?.value || Infinity;
    const sort = sortSelect?.value || 'newest';
    const activeChip = document.querySelector('.filter-chip.active')?.dataset.filter;

    if (search) products = products.filter(p => p.name.toLowerCase().includes(search) || p.shortDescription?.toLowerCase().includes(search));
    if (category) products = products.filter(p => p.category === category);
    if (min) products = products.filter(p => p.price >= min);
    if (max !== Infinity) products = products.filter(p => p.price <= max);
    if (activeChip === 'featured') products = products.filter(p => p.featured);
    if (activeChip === 'available') products = products.filter(p => p.available);

    switch (sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: products.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    return products;
  }

  function renderPage() {
    const filtered = getFiltered();
    const total = filtered.length;
    const start = (currentPage - 1) * perPage;
    const pageProducts = filtered.slice(start, start + perPage);

    if (resultsCount) resultsCount.textContent = `${total} منتج`;

    if (!pageProducts.length) {
      grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>لا توجد منتجات مطابقة للبحث</p></div>';
    } else {
      grid.innerHTML = pageProducts.map(p => renderProductCard(p, settings)).join('');
    }

    renderPagination(Math.ceil(total / perPage));
    updateWishlistButtons();
  }

  function renderPagination(totalPages) {
    if (!paginationEl || totalPages <= 1) { if (paginationEl) paginationEl.innerHTML = ''; return; }
    let html = '';
    if (currentPage > 1) html += `<button class="page-btn" onclick="goPage(${currentPage-1})"><i class="fas fa-chevron-right"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages) html += `<button class="page-btn" onclick="goPage(${currentPage+1})"><i class="fas fa-chevron-left"></i></button>`;
    paginationEl.innerHTML = html;
  }

  window.goPage = (n) => { currentPage = n; renderPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPage = 1;
      renderPage();
    });
  });

  // Input events
  [searchInput, categoryFilter, priceMin, priceMax, sortSelect].forEach(el => {
    if (el) el.addEventListener('input', () => { currentPage = 1; renderPage(); });
  });

  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category') && categoryFilter) categoryFilter.value = urlParams.get('category');

  await loadData();
});
