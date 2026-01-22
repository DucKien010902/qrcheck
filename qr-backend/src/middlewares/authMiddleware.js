const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Lấy token từ header
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Giải mã token
    req.user = decoded; // Lưu thông tin user vào request
    next(); // Cho phép request tiếp tục
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ!' });
  }
};

module.exports = authMiddleware;
