/* ═════════════════════════════════════════
   admin.js — Admin dashboard logic
   ═════════════════════════════════════════ */

// ─── Auth ─────────────────────────────────
async function checkAuth() {
  const r = await fetch('/api/auth/check');
  const { loggedIn } = await r.json();
  return loggedIn;
}

async function login(email, password) {
  const r = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return r.ok;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  showLogin();
}

// ─── Page state ───────────────────────────
let currentSection = 'dashboard';
let editingId = null;
let productImages = [];
let allCategories = [];

// ─── API helpers ──────────────────────────
async function api(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'خطأ في العملية');
  return data;
}

// ─── Image upload helper ──────────────────
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const r = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'فشل رفع الصورة');
  return data.url;
}

// ─── Tags input helper ────────────────────
function initTagsInput(containerId, inputId) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  if (!container || !input) return;

  input.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      addTag(container, input.value.trim(), inputId);
      input.value = '';
    }
  });
  container.addEventListener('click', () => input.focus());
}

function addTag(container, text, inputId) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.dataset.value = text;
  tag.innerHTML = `${text}<button onclick="removeTag(this)">✕</button>`;
  container.insertBefore(tag, document.getElementById(inputId));
}

window.removeTag = (btn) => btn.closest('.tag').remove();

function getTagValues(containerId) {
  return [...document.querySelectorAll(`#${containerId} .tag`)].map(t => t.dataset.value);
}

function setTagValues(containerId, inputId, values) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.tag').forEach(t => t.remove());
  (values || []).forEach(v => addTag(container, v, inputId));
}

// ─── Image upload zone ────────────────────
function initImageUpload(zoneId, previewId) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;

  zone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
    input.onchange = async (e) => {
      for (const file of e.target.files) {
        await addImageFile(file, previewId);
      }
    };
    input.click();
  });

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', async (e) => {
    e.preventDefault(); zone.classList.remove('dragover');
    for (const file of e.dataTransfer.files) {
      if (file.type.startsWith('image/')) await addImageFile(file, previewId);
    }
  });
}

async function addImageFile(file, previewId) {
  try {
    showToast('جاري رفع الصورة...');
    const url = await uploadImage(file);
    productImages.push(url);
    renderImagePreviews(previewId);
    showToast('تم رفع الصورة بنجاح', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

function renderImagePreviews(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.innerHTML = productImages.map((url, i) => `
    <div class="image-preview-item">
      <img src="${url}" alt="صورة ${i+1}">
      <button onclick="removeProductImage(${i}, '${previewId}')">✕</button>
    </div>`).join('');
}

window.removeProductImage = (idx, previewId) => {
  productImages.splice(idx, 1);
  renderImagePreviews(previewId);
};

// ─── Modal ────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
window.closeModal = closeModal;

// ─── Sections ─────────────────────────────
function showSection(name) {
  currentSection = name;
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  const sec = document.getElementById(`section-${name}`);
  if (sec) sec.style.display = 'block';

  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.section === name));

  const titles = {
    dashboard: 'لوحة التحكم', products: 'إدارة المنتجات', categories: 'إدارة التصنيفات',
    offers: 'إدارة العروض', messages: 'الرسائل الواردة', settings: 'إعدادات الموقع'
  };
  document.getElementById('topbarTitle').textContent = titles[name] || '';

  if (name === 'dashboard') loadDashboard();
  else if (name === 'products') loadProducts();
  else if (name === 'categories') loadCategories();
  else if (name === 'offers') loadOffers();
  else if (name === 'messages') loadMessages();
  else if (name === 'settings') loadSettings();
}
window.showSection = showSection;

// ─── Dashboard ────────────────────────────
async function loadDashboard() {
  try {
    const stats = await api('GET', '/api/stats');
    setValue('statProducts', stats.products);
    setValue('statCategories', stats.categories);
    setValue('statMessages', stats.messages);
    setValue('statUnread', stats.unreadMessages);
    setValue('statOffers', stats.offers);

    // Recent messages
    const msgs = await api('GET', '/api/messages');
    const recentEl = document.getElementById('recentMessages');
    if (recentEl) {
      const recent = msgs.slice(-5).reverse();
      recentEl.innerHTML = recent.length ? recent.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.message.substring(0, 50)}...</td>
          <td>${formatDate(m.createdAt)}</td>
          <td><span class="badge badge-${m.read ? 'gold' : 'blue'}">${m.read ? 'مقروءة' : 'جديدة'}</span></td>
        </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">لا توجد رسائل</td></tr>';
    }
  } catch (e) { console.error(e); }
}

// ─── Products ─────────────────────────────
async function loadProducts() {
  const [products, cats] = await Promise.all([api('GET', '/api/products?available=all'), api('GET', '/api/categories')]);
  allCategories = cats;

  const tbody = document.getElementById('productsTable');
  if (!tbody) return;
  tbody.innerHTML = products.length ? products.map(p => `
    <tr>
      <td><img class="product-thumb" src="${p.images?.[0] || '/assets/images/product-placeholder.jpg'}" alt="${p.name}" onerror="this.src='/assets/images/product-placeholder.jpg'"></td>
      <td><strong>${p.name}</strong><br><small style="color:var(--text-muted)">${p.category}</small></td>
      <td>${p.price.toLocaleString('ar-SA')} ر.س</td>
      <td><span class="badge badge-${p.available ? 'green' : 'red'}">${p.available ? 'متوفر' : 'غير متوفر'}</span></td>
      <td><span class="badge badge-${p.featured ? 'gold' : 'blue'}">${p.featured ? 'مميز' : 'عادي'}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="editProduct('${p.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
          <button class="action-btn action-btn-delete" onclick="deleteProduct('${p.id}', '${p.name}')" title="حذف"><i class="fas fa-trash"></i></button>
          <a href="/product/${p.id}" target="_blank" class="action-btn action-btn-view" title="عرض"><i class="fas fa-eye"></i></a>
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px">لا توجد منتجات</td></tr>';

  // Populate category select in form
  const catSel = document.getElementById('productCategory');
  if (catSel) {
    catSel.innerHTML = '<option value="">اختر التصنيف</option>' + cats.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
  }
}

window.editProduct = async (id) => {
  editingId = id;
  productImages = [];
  try {
    const p = await api('GET', `/api/products/${id}`);
    productImages = [...(p.images || [])];

    setValue('productName', p.name);
    setValue('productPrice', p.price);
    setValue('productCategory', p.category);
    setValue('productShortDesc', p.shortDescription);
    setValue('productDesc', p.description);
    setValue('productMaterial', p.material);
    setChecked('productFeatured', p.featured);
    setChecked('productAvailable', p.available);
    setTagValues('colorsTagsContainer', 'colorTagInput', p.colors);
    setTagValues('sizesTagsContainer', 'sizeTagInput', p.sizes);
    renderImagePreviews('productImagePreview');

    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    openModal('productModal');
  } catch (e) { showToast(e.message, 'error'); }
};

window.deleteProduct = async (id, name) => {
  if (!confirm(`هل أنت متأكد من حذف المنتج: ${name}؟`)) return;
  try {
    await api('DELETE', `/api/products/${id}`);
    showToast('تم حذف المنتج بنجاح', 'success');
    loadProducts();
  } catch (e) { showToast(e.message, 'error'); }
};

function openAddProduct() {
  editingId = null;
  productImages = [];
  document.getElementById('productForm')?.reset();
  document.querySelectorAll('#productModal .tag').forEach(t => t.remove());
  renderImagePreviews('productImagePreview');
  document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
  openModal('productModal');
}
window.openAddProduct = openAddProduct;

async function saveProduct() {
  const data = {
    name: getVal('productName'),
    price: +getVal('productPrice'),
    category: getVal('productCategory'),
    shortDescription: getVal('productShortDesc'),
    description: getVal('productDesc'),
    material: getVal('productMaterial'),
    colors: getTagValues('colorsTagsContainer'),
    sizes: getTagValues('sizesTagsContainer'),
    images: productImages,
    featured: document.getElementById('productFeatured')?.checked || false,
    available: document.getElementById('productAvailable')?.checked ?? true,
  };
  if (!data.name || !data.price) { showToast('الاسم والسعر مطلوبان', 'error'); return; }
  try {
    if (editingId) await api('PUT', `/api/products/${editingId}`, data);
    else await api('POST', '/api/products', data);
    showToast(`تم ${editingId ? 'تعديل' : 'إضافة'} المنتج بنجاح`, 'success');
    closeModal('productModal');
    loadProducts();
  } catch (e) { showToast(e.message, 'error'); }
}
window.saveProduct = saveProduct;

// ─── Categories ───────────────────────────
async function loadCategories() {
  const cats = await api('GET', '/api/categories');
  const tbody = document.getElementById('categoriesTable');
  if (!tbody) return;
  tbody.innerHTML = cats.length ? cats.map(c => `
    <tr>
      <td style="font-size:1.5rem">${c.icon}</td>
      <td><strong>${c.name}</strong></td>
      <td><code style="font-size:.8rem;background:var(--beige);padding:2px 6px;border-radius:4px">${c.slug}</code></td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="editCategory('${c.id}','${c.name}','${c.slug}','${c.icon}')" title="تعديل"><i class="fas fa-edit"></i></button>
          <button class="action-btn action-btn-delete" onclick="deleteCategory('${c.id}','${c.name}')" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px">لا توجد تصنيفات</td></tr>';
}

window.editCategory = (id, name, slug, icon) => {
  editingId = id;
  setValue('catName', name); setValue('catSlug', slug); setValue('catIcon', icon);
  document.getElementById('catModalTitle').textContent = 'تعديل التصنيف';
  openModal('categoryModal');
};

window.deleteCategory = async (id, name) => {
  if (!confirm(`حذف التصنيف: ${name}؟`)) return;
  try { await api('DELETE', `/api/categories/${id}`); showToast('تم الحذف', 'success'); loadCategories(); }
  catch (e) { showToast(e.message, 'error'); }
};

function openAddCategory() {
  editingId = null;
  document.getElementById('categoryForm')?.reset();
  document.getElementById('catModalTitle').textContent = 'إضافة تصنيف جديد';
  openModal('categoryModal');
}
window.openAddCategory = openAddCategory;

async function saveCategory() {
  const data = { name: getVal('catName'), slug: getVal('catSlug'), icon: getVal('catIcon') };
  if (!data.name) { showToast('الاسم مطلوب', 'error'); return; }
  if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  try {
    if (editingId) await api('PUT', `/api/categories/${editingId}`, data);
    else await api('POST', '/api/categories', data);
    showToast('تم الحفظ بنجاح', 'success'); closeModal('categoryModal'); loadCategories();
  } catch (e) { showToast(e.message, 'error'); }
}
window.saveCategory = saveCategory;

// ─── Offers ───────────────────────────────
async function loadOffers() {
  const offers = await api('GET', '/api/offers');
  const tbody = document.getElementById('offersTable');
  if (!tbody) return;
  tbody.innerHTML = offers.length ? offers.map(o => `
    <tr>
      <td><strong>${o.title}</strong></td>
      <td>${o.discount}</td>
      <td>${o.startDate} — ${o.endDate}</td>
      <td><span class="badge badge-${o.active ? 'green' : 'red'}">${o.active ? 'نشط' : 'موقف'}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="editOffer('${o.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
          <button class="action-btn action-btn-delete" onclick="deleteOffer('${o.id}','${o.title}')" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px">لا توجد عروض</td></tr>';
}

window.editOffer = async (id) => {
  editingId = id;
  const offers = await api('GET', '/api/offers');
  const o = offers.find(x => x.id === id);
  if (!o) return;
  setValue('offerTitle', o.title); setValue('offerDesc', o.description); setValue('offerDiscount', o.discount);
  setValue('offerStart', o.startDate); setValue('offerEnd', o.endDate); setChecked('offerActive', o.active);
  document.getElementById('offerModalTitle').textContent = 'تعديل العرض';
  openModal('offerModal');
};

window.deleteOffer = async (id, title) => {
  if (!confirm(`حذف العرض: ${title}؟`)) return;
  try { await api('DELETE', `/api/offers/${id}`); showToast('تم الحذف', 'success'); loadOffers(); }
  catch (e) { showToast(e.message, 'error'); }
};

function openAddOffer() {
  editingId = null; document.getElementById('offerForm')?.reset();
  document.getElementById('offerModalTitle').textContent = 'إضافة عرض جديد';
  openModal('offerModal');
}
window.openAddOffer = openAddOffer;

async function saveOffer() {
  const data = {
    title: getVal('offerTitle'), description: getVal('offerDesc'), discount: getVal('offerDiscount'),
    startDate: getVal('offerStart'), endDate: getVal('offerEnd'), active: document.getElementById('offerActive')?.checked || false
  };
  if (!data.title) { showToast('العنوان مطلوب', 'error'); return; }
  try {
    if (editingId) await api('PUT', `/api/offers/${editingId}`, data);
    else await api('POST', '/api/offers', data);
    showToast('تم الحفظ', 'success'); closeModal('offerModal'); loadOffers();
  } catch (e) { showToast(e.message, 'error'); }
}
window.saveOffer = saveOffer;

// ─── Messages ─────────────────────────────
async function loadMessages() {
  const msgs = await api('GET', '/api/messages');
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  if (!msgs.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد رسائل</p></div>'; return; }

  container.innerHTML = msgs.reverse().map(m => `
    <div class="admin-card" style="margin-bottom:16px">
      <div class="admin-card-header">
        <div>
          <strong>${m.name}</strong>
          ${m.email ? `<span style="color:var(--text-muted);margin:0 8px">•</span><span style="color:var(--text-muted);font-size:.85rem">${m.email}</span>` : ''}
          ${m.phone ? `<span style="color:var(--text-muted);margin:0 8px">•</span><span style="color:var(--text-muted);font-size:.85rem">${m.phone}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:.78rem;color:var(--text-muted)">${formatDate(m.createdAt)}</span>
          <span class="badge badge-${m.read ? 'gold' : 'blue'}">${m.read ? 'مقروءة' : 'جديدة'}</span>
          ${!m.read ? `<button class="action-btn action-btn-view" onclick="markRead('${m.id}')" title="تعيين كمقروءة"><i class="fas fa-check"></i></button>` : ''}
          <button class="action-btn action-btn-delete" onclick="deleteMessage('${m.id}')" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="admin-card-body">
        <p style="font-size:.9rem;line-height:1.8">${m.message}</p>
      </div>
    </div>`).join('');
}

window.markRead = async (id) => {
  try { await api('PUT', `/api/messages/${id}/read`); loadMessages(); loadDashboard(); }
  catch (e) { showToast(e.message, 'error'); }
};
window.deleteMessage = async (id) => {
  if (!confirm('حذف هذه الرسالة؟')) return;
  try { await api('DELETE', `/api/messages/${id}`); showToast('تم الحذف', 'success'); loadMessages(); loadDashboard(); }
  catch (e) { showToast(e.message, 'error'); }
};

// ─── Settings ─────────────────────────────
async function loadSettings() {
  try {
    const s = await api('GET', '/api/settings');
    ['storeName','storeNameEn','whatsapp','instagram','facebook','tiktok','address','workingHours','heroTitle','heroSubtitle','aboutText','adminEmail'].forEach(k => {
      setValue(`setting_${k}`, s[k] || '');
    });
    const textarea = document.getElementById('setting_aboutText');
    if (textarea) textarea.value = s.aboutText || '';
  } catch (e) { showToast(e.message, 'error'); }
}

async function saveSettings() {
  const data = {};
  ['storeName','storeNameEn','whatsapp','instagram','facebook','tiktok','address','workingHours','heroTitle','heroSubtitle','aboutText','adminEmail'].forEach(k => {
    data[k] = getVal(`setting_${k}`);
  });
  const newPass = getVal('setting_newPassword');
  if (newPass) data.newPassword = newPass;
  try {
    await api('PUT', '/api/settings', data);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}
window.saveSettings = saveSettings;

// ─── Helpers ──────────────────────────────
function getVal(id) { return document.getElementById(id)?.value || ''; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Login / Logout UI ────────────────────
function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
}
function showDashboard() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'grid';
  showSection('dashboard');
}

// ─── Init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  document.querySelectorAll('#themeToggle').forEach(b => b.addEventListener('click', toggleTheme));

  const loggedIn = await checkAuth();
  if (loggedIn) showDashboard();
  else showLogin();

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'جاري الدخول...';
    const ok = await login(email, password);
    if (ok) showDashboard();
    else { showToast('بيانات الدخول غير صحيحة', 'error'); btn.disabled = false; btn.textContent = 'دخول'; }
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // Sidebar links
  document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
      document.getElementById('adminSidebar')?.classList.remove('mobile-open');
    });
  });

  // Mobile menu toggle
  document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar')?.classList.toggle('mobile-open');
  });

  // Init tag inputs
  initTagsInput('colorsTagsContainer', 'colorTagInput');
  initTagsInput('sizesTagsContainer', 'sizeTagInput');
  initImageUpload('imageUploadZone', 'productImagePreview');
});
