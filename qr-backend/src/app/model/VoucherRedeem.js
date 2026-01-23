const mongoose = require('mongoose');

const VoucherRedeemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    redeemedAt: { type: Date, required: true },

    // ✅ log ảnh
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VoucherRedeem', VoucherRedeemSchema);
