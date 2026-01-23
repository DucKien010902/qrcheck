const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // 10 ký tự
    discountPercent: { type: Number, required: true, min: 1, max: 90 },
    expiresAt: { type: Date, required: true, index: true },

    redeemedAt: { type: Date, default: null, index: true },
    redeemedAmount: { type: Number, default: null }, // amount trước giảm

    // ✅ thêm ảnh xác nhận khi redeem
    redeemedImageUrl: { type: String, default: null },
    redeemedImagePublicId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', VoucherSchema, 'vouchersQR');
