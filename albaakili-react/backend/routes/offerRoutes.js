const express = require('express');
const xss = require('xss');
const { readJSON, writeJSON } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/authMiddleware');
const { genId } = require('../utils/slugify');

const router = express.Router();

router.get('/', (req, res) => {
  let offers = readJSON('offers.json');
  if (!req.query.admin) {
    const now = new Date();
    offers = offers.filter(o => o.active && new Date(o.endDate) >= now);
  }
  res.json(offers);
});

router.post('/', requireAuth, (req, res) => {
  const offers = readJSON('offers.json');
  const b = req.body;
  const offer = {
    id: genId('off'),
    title: xss(b.title || ''),
    description: xss(b.description || ''),
    discount: xss(b.discount || ''),
    image: b.image || '',
    startDate: b.startDate || '',
    endDate: b.endDate || '',
    active: !!b.active,
    createdAt: new Date().toISOString()
  };
  if (!offer.title) return res.status(400).json({ error: 'عنوان العرض مطلوب' });
  offers.push(offer);
  writeJSON('offers.json', offers);
  res.status(201).json(offer);
});

router.put('/:id', requireAuth, (req, res) => {
  const offers = readJSON('offers.json');
  const idx = offers.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'العرض غير موجود' });
  offers[idx] = { ...offers[idx], ...req.body, id: offers[idx].id };
  writeJSON('offers.json', offers);
  res.json(offers[idx]);
});

router.delete('/:id', requireAuth, (req, res) => {
  let offers = readJSON('offers.json');
  if (!offers.find(o => o.id === req.params.id)) return res.status(404).json({ error: 'العرض غير موجود' });
  offers = offers.filter(o => o.id !== req.params.id);
  writeJSON('offers.json', offers);
  res.json({ success: true });
});

module.exports = router;
