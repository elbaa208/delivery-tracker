const express = require('express');
const xss = require('xss');
const { readJSON, writeJSON } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/authMiddleware');
const { genId, slugify } = require('../utils/slugify');

const router = express.Router();

router.get('/', (req, res) => {
  let cats = readJSON('categories.json');
  if (!req.query.admin) cats = cats.filter(c => c.active !== false);
  cats.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(cats);
});

router.post('/', requireAuth, (req, res) => {
  const cats = readJSON('categories.json');
  const name = xss(req.body.name || '');
  if (!name) return res.status(400).json({ error: 'الاسم مطلوب' });
  const cat = {
    id: genId('cat'),
    name,
    slug: req.body.slug || slugify(name),
    image: req.body.image || '',
    active: req.body.active !== false,
    order: req.body.order !== undefined ? +req.body.order : cats.length + 1
  };
  cats.push(cat);
  writeJSON('categories.json', cats);
  res.status(201).json(cat);
});

router.put('/:id', requireAuth, (req, res) => {
  const cats = readJSON('categories.json');
  const idx = cats.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'التصنيف غير موجود' });
  cats[idx] = { ...cats[idx], ...req.body, id: cats[idx].id };
  writeJSON('categories.json', cats);
  res.json(cats[idx]);
});

router.delete('/:id', requireAuth, (req, res) => {
  let cats = readJSON('categories.json');
  if (!cats.find(c => c.id === req.params.id)) return res.status(404).json({ error: 'التصنيف غير موجود' });
  cats = cats.filter(c => c.id !== req.params.id);
  writeJSON('categories.json', cats);
  res.json({ success: true });
});

module.exports = router;
