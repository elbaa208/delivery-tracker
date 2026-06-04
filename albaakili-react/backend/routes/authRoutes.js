const express = require('express');
const bcrypt = require('bcryptjs');
const { readJSON } = require('../utils/fileStorage');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });

  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'خطأ في الخروج' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.json({ user: null });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

module.exports = router;
