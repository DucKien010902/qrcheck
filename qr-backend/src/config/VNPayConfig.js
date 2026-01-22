// config/VNPayConfig.js
const crypto = require('crypto');

const vnpayConfig = {
  vnp_PayUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: 'https://yourdomain.com/vnpay_return', // thay đổi cho đúng callback của bạn
  vnp_TmnCode: 'HA8JKRZ7',
  vnp_HashSecret: 'T58U67DMCO4FIOAZ7FUTWENOBGGIJUWP',

  hmacSHA512: (key, data) => {
    return crypto
      .createHmac('sha512', key)
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');
  },

  sortObject: (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  },

  getIpAddress: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  },
};

module.exports = vnpayConfig;
