const express = require('express');
const xss = require('xss');
const { readJSON, writeJSON } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readJSON('settings.json'));
});

router.put('/', requireAuth, (req, res) => {
  const current = readJSON('settings.json');
  const allowed = ['storeName','storeNameEn','whatsapp','phone','city','country','currency','address','workingHours','instagram','facebook','tiktok','googleMapsEmbed','heroTitle','heroSubtitle','aboutText','metaDescription','logo'];
  const updated = { ...current };
  allowed.forEach(k => { if (req.body[k] !== undefined) updated[k] = xss(String(req.body[k])); });
  writeJSON('settings.json', updated);
  res.json(updated);
});

module.exports = router;
