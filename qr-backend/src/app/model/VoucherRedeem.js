const mongoose = require("mongoose");

const VoucherRedeemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    redeemedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoucherRedeem", VoucherRedeemSchema);
