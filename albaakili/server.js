const express = require('express');
const session = require('express-session');
const multer = require('multer');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const xss = require('xss');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      frameSrc: ["https://www.google.com"],
    },
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: 'albaakili-secret-2024-xK9mP',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Block direct data access
app.use('/data', (req, res) => res.status(403).json({ error: 'Forbidden' }));

// ─── Multer for image uploads ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('نوع الملف غير مسموح به'));
  }
});

// ─── Data helpers ─────────────────────────────────────────────────────────────
const dataPath = path.join(__dirname, 'data');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
  } catch { return file.includes('messages') || file.includes('products') || file.includes('categories') || file.includes('offers') ? [] : {}; }
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataPath, file), JSON.stringify(data, null, 2), 'utf8');
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return xss(str.trim());
}

function genId() {
  return Date.now().toString();
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'غير مصرح' });
}

// ─── Auth routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const settings = readJSON('settings.json');
  if (email === settings.adminEmail && password === settings.adminPassword) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'بيانات دخول غير صحيحة' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.admin) });
});

// ─── Products API ─────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  let products = readJSON('products.json');
  const { category, featured, search, minPrice, maxPrice, color, available, skipAvailableFilter } = req.query;
  if (category) products = products.filter(p => p.category === category);
  if (featured === 'true') products = products.filter(p => p.featured);
  if (!skipAvailableFilter && available !== 'false') products = products.filter(p => p.available !== false);
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
  }
  if (minPrice) products = products.filter(p => p.price >= +minPrice);
  if (maxPrice) products = products.filter(p => p.price <= +maxPrice);
  if (color) products = products.filter(p => p.colors && p.colors.some(c => c.includes(color)));
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readJSON('products.json');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.json(product);
});

app.post('/api/products', requireAdmin, (req, res) => {
  const products = readJSON('products.json');
  const p = req.body;
  const newProduct = {
    id: genId(),
    name: sanitize(p.name || ''),
    price: +p.price || 0,
    category: sanitize(p.category || ''),
    shortDescription: sanitize(p.shortDescription || ''),
    description: sanitize(p.description || ''),
    colors: Array.isArray(p.colors) ? p.colors.map(sanitize) : [],
    sizes: Array.isArray(p.sizes) ? p.sizes.map(sanitize) : [],
    material: sanitize(p.material || ''),
    images: Array.isArray(p.images) ? p.images : [],
    featured: !!p.featured,
    available: p.available !== false,
    createdAt: new Date().toISOString().split('T')[0]
  };
  products.push(newProduct);
  writeJSON('products.json', products);
  res.json(newProduct);
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'المنتج غير موجود' });
  const p = req.body;
  products[idx] = {
    ...products[idx],
    name: sanitize(p.name || products[idx].name),
    price: p.price !== undefined ? +p.price : products[idx].price,
    category: sanitize(p.category || products[idx].category),
    shortDescription: sanitize(p.shortDescription || products[idx].shortDescription),
    description: sanitize(p.description || products[idx].description),
    colors: Array.isArray(p.colors) ? p.colors.map(sanitize) : products[idx].colors,
    sizes: Array.isArray(p.sizes) ? p.sizes.map(sanitize) : products[idx].sizes,
    material: sanitize(p.material || products[idx].material),
    images: Array.isArray(p.images) ? p.images : products[idx].images,
    featured: p.featured !== undefined ? !!p.featured : products[idx].featured,
    available: p.available !== undefined ? !!p.available : products[idx].available,
  };
  writeJSON('products.json', products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  let products = readJSON('products.json');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  products = products.filter(p => p.id !== req.params.id);
  writeJSON('products.json', products);
  res.json({ success: true });
});

// ─── Categories API ───────────────────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  res.json(readJSON('categories.json'));
});

app.post('/api/categories', requireAdmin, (req, res) => {
  const cats = readJSON('categories.json');
  const c = {
    id: genId(),
    name: sanitize(req.body.name || ''),
    slug: sanitize(req.body.slug || req.body.name?.toLowerCase().replace(/\s+/g, '-') || ''),
    icon: sanitize(req.body.icon || '🏷️'),
    image: req.body.image || ''
  };
  cats.push(c);
  writeJSON('categories.json', cats);
  res.json(c);
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const cats = readJSON('categories.json');
  const idx = cats.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'التصنيف غير موجود' });
  cats[idx] = { ...cats[idx], ...req.body, id: cats[idx].id };
  writeJSON('categories.json', cats);
  res.json(cats[idx]);
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  let cats = readJSON('categories.json');
  cats = cats.filter(c => c.id !== req.params.id);
  writeJSON('categories.json', cats);
  res.json({ success: true });
});

// ─── Messages API ─────────────────────────────────────────────────────────────
app.get('/api/messages', requireAdmin, (req, res) => {
  res.json(readJSON('messages.json'));
});

app.post('/api/messages', (req, res) => {
  const msgs = readJSON('messages.json');
  const m = {
    id: genId(),
    name: sanitize(req.body.name || ''),
    email: sanitize(req.body.email || ''),
    phone: sanitize(req.body.phone || ''),
    message: sanitize(req.body.message || ''),
    read: false,
    createdAt: new Date().toISOString()
  };
  if (!m.name || !m.message) return res.status(400).json({ error: 'الاسم والرسالة مطلوبان' });
  msgs.push(m);
  writeJSON('messages.json', msgs);
  res.json({ success: true });
});

app.put('/api/messages/:id/read', requireAdmin, (req, res) => {
  const msgs = readJSON('messages.json');
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  msgs[idx].read = true;
  writeJSON('messages.json', msgs);
  res.json({ success: true });
});

app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  let msgs = readJSON('messages.json');
  msgs = msgs.filter(m => m.id !== req.params.id);
  writeJSON('messages.json', msgs);
  res.json({ success: true });
});

// ─── Offers API ───────────────────────────────────────────────────────────────
app.get('/api/offers', (req, res) => {
  const offers = readJSON('offers.json');
  if (req.query.active === 'true') {
    const now = new Date();
    return res.json(offers.filter(o => o.active && new Date(o.endDate) >= now));
  }
  res.json(offers);
});

app.post('/api/offers', requireAdmin, (req, res) => {
  const offers = readJSON('offers.json');
  const o = {
    id: genId(),
    title: sanitize(req.body.title || ''),
    description: sanitize(req.body.description || ''),
    discount: sanitize(req.body.discount || ''),
    image: req.body.image || '',
    startDate: req.body.startDate || '',
    endDate: req.body.endDate || '',
    active: !!req.body.active
  };
  offers.push(o);
  writeJSON('offers.json', offers);
  res.json(o);
});

app.put('/api/offers/:id', requireAdmin, (req, res) => {
  const offers = readJSON('offers.json');
  const idx = offers.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'العرض غير موجود' });
  offers[idx] = { ...offers[idx], ...req.body, id: offers[idx].id };
  writeJSON('offers.json', offers);
  res.json(offers[idx]);
});

app.delete('/api/offers/:id', requireAdmin, (req, res) => {
  let offers = readJSON('offers.json');
  offers = offers.filter(o => o.id !== req.params.id);
  writeJSON('offers.json', offers);
  res.json({ success: true });
});

// ─── Settings API ─────────────────────────────────────────────────────────────
app.get('/api/settings/public', (req, res) => {
  const s = readJSON('settings.json');
  const { adminEmail, adminPassword, ...pub } = s;
  res.json(pub);
});

app.get('/api/settings', requireAdmin, (req, res) => {
  const s = readJSON('settings.json');
  const { adminPassword, ...safe } = s;
  res.json(safe);
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const current = readJSON('settings.json');
  const allowed = ['storeName','storeNameEn','whatsapp','instagram','facebook','tiktok','address','workingHours','heroTitle','heroSubtitle','aboutText','googleMapsEmbed','logo','metaDescription','adminEmail'];
  const updated = { ...current };
  allowed.forEach(k => { if (req.body[k] !== undefined) updated[k] = sanitize(req.body[k]); });
  if (req.body.newPassword && req.body.newPassword.length >= 6) {
    updated.adminPassword = req.body.newPassword;
  }
  writeJSON('settings.json', updated);
  const { adminPassword, ...safe } = updated;
  res.json(safe);
});

// ─── Upload API ───────────────────────────────────────────────────────────────
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي صورة' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/upload/multiple', requireAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'لم يتم رفع أي صور' });
  res.json({ urls: req.files.map(f => `/uploads/${f.filename}`) });
});

// ─── Stats API ────────────────────────────────────────────────────────────────
app.get('/api/stats', requireAdmin, (req, res) => {
  res.json({
    products: readJSON('products.json').length,
    categories: readJSON('categories.json').length,
    messages: readJSON('messages.json').length,
    unreadMessages: readJSON('messages.json').filter(m => !m.read).length,
    offers: readJSON('offers.json').length,
  });
});

// ─── SPA fallback for HTML pages ──────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/product/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/offers', (req, res) => res.sendFile(path.join(__dirname, 'public', 'offers.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => console.log(`✅ البعقيلي للحجاب يعمل على http://localhost:${PORT}`));
