const express = require('express');
const xss = require('xss');
const { readJSON, writeJSON } = require('../utils/fileStorage');
const { requireAuth } = require('../middleware/authMiddleware');
const { genId } = require('../utils/slugify');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json(readJSON('messages.json').reverse());
});

router.post('/', (req, res) => {
  const msgs = readJSON('messages.json');
  const { name, phone, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'الاسم والرسالة مطلوبان' });
  const msg = {
    id: genId('msg'),
    name: xss(name),
    phone: xss(phone || ''),
    message: xss(message),
    status: 'new',
    createdAt: new Date().toISOString()
  };
  msgs.push(msg);
  writeJSON('messages.json', msgs);
  res.status(201).json({ success: true });
});

router.put('/:id', requireAuth, (req, res) => {
  const msgs = readJSON('messages.json');
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  msgs[idx] = { ...msgs[idx], status: req.body.status || msgs[idx].status };
  writeJSON('messages.json', msgs);
  res.json(msgs[idx]);
});

router.delete('/:id', requireAuth, (req, res) => {
  let msgs = readJSON('messages.json');
  if (!msgs.find(m => m.id === req.params.id)) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  msgs = msgs.filter(m => m.id !== req.params.id);
  writeJSON('messages.json', msgs);
  res.json({ success: true });
});

module.exports = router;
