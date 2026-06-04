const express = require('express');
const xss = require('xss');
const { readJSON, writeJSON } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/authMiddleware');
const { genId, slugify } = require('../utils/slugify');

const router = express.Router();

// GET all — public, with optional filters
router.get('/', (req, res) => {
  let products = readJSON('products.json');
  const { category, featured, search, minPrice, maxPrice, available, admin } = req.query;

  if (!admin) products = products.filter(p => p.available !== false);
  if (category) products = products.filter(p => p.categoryId === category);
  if (featured === 'true') products = products.filter(p => p.featured);
  if (available === 'false') products = products.filter(p => !p.available);
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.shortDescription?.toLowerCase().includes(q));
  }
  if (minPrice) products = products.filter(p => p.price >= +minPrice);
  if (maxPrice) products = products.filter(p => p.price <= +maxPrice);

  res.json(products);
});

// GET one — public
router.get('/:id', (req, res) => {
  const products = readJSON('products.json');
  const p = products.find(x => x.id === req.params.id || x.slug === req.params.id);
  if (!p) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.json(p);
});

// POST — protected
router.post('/', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const b = req.body;
  const name = xss(b.name || '');
  const newProduct = {
    id: genId('prd'),
    slug: b.slug || slugify(name) || genId('prd'),
    name,
    price: +b.price || 0,
    categoryId: xss(b.categoryId || ''),
    material: xss(b.material || ''),
    colors: Array.isArray(b.colors) ? b.colors.map(c => xss(c)) : [],
    sizes: Array.isArray(b.sizes) ? b.sizes.map(s => xss(s)) : [],
    shortDescription: xss(b.shortDescription || ''),
    description: xss(b.description || ''),
    images: Array.isArray(b.images) ? b.images : [],
    featured: !!b.featured,
    available: b.available !== false,
    createdAt: new Date().toISOString()
  };
  if (!newProduct.name) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  products.push(newProduct);
  writeJSON('products.json', products);
  res.status(201).json(newProduct);
});

// PUT — protected
router.put('/:id', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'المنتج غير موجود' });
  const b = req.body;
  const cur = products[idx];
  products[idx] = {
    ...cur,
    name: b.name !== undefined ? xss(b.name) : cur.name,
    price: b.price !== undefined ? +b.price : cur.price,
    categoryId: b.categoryId !== undefined ? xss(b.categoryId) : cur.categoryId,
    material: b.material !== undefined ? xss(b.material) : cur.material,
    colors: b.colors !== undefined ? (Array.isArray(b.colors) ? b.colors.map(c => xss(c)) : cur.colors) : cur.colors,
    sizes: b.sizes !== undefined ? (Array.isArray(b.sizes) ? b.sizes.map(s => xss(s)) : cur.sizes) : cur.sizes,
    shortDescription: b.shortDescription !== undefined ? xss(b.shortDescription) : cur.shortDescription,
    description: b.description !== undefined ? xss(b.description) : cur.description,
    images: b.images !== undefined ? (Array.isArray(b.images) ? b.images : cur.images) : cur.images,
    featured: b.featured !== undefined ? !!b.featured : cur.featured,
    available: b.available !== undefined ? !!b.available : cur.available,
    slug: b.slug || cur.slug,
  };
  writeJSON('products.json', products);
  res.json(products[idx]);
});

// DELETE — protected
router.delete('/:id', requireAuth, (req, res) => {
  let products = readJSON('products.json');
  const exists = products.find(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'المنتج غير موجود' });
  products = products.filter(p => p.id !== req.params.id);
  writeJSON('products.json', products);
  res.json({ success: true });
});

module.exports = router;
