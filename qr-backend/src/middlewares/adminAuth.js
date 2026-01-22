module.exports = function adminAuth(req, res, next) {
  // session cookie
  if (req.cookies?.admin_auth === 'true') return next();
  return res.status(401).json({ message: 'Chưa đăng nhập admin.' });
};
