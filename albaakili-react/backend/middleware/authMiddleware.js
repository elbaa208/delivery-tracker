function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
}

module.exports = { requireAuth };
