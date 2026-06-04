const express = require('express');
const { upload } = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي صورة' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.post('/multiple', requireAuth, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'لم يتم رفع أي صور' });
  res.json({ urls: req.files.map(f => `/uploads/${f.filename}`) });
});

module.exports = router;
