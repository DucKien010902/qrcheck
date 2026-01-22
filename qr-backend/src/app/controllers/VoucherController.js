const Voucher = require("../model/Voucher");
const VoucherRedeem = require("../model/VoucherRedeem");
const { genCode, buildVoucherLink, generateQrDataUrl } = require("../service/voucherService");

// Admin: list vouchers
exports.adminList = async (req, res) => {
  const docs = await Voucher.find().sort({ createdAt: -1 }).lean();

  const items = await Promise.all(
    docs.map(async (v) => {
      const link = buildVoucherLink(v.code);
      const qrDataUrl = await generateQrDataUrl(link);

      return {
        code: v.code,
        discountPercent: v.discountPercent,
        expiresAt: v.expiresAt,
        redeemedAt: v.redeemedAt,
        link,
        qrDataUrl,
      };
    })
  );

  return res.json({ items });
};


// Admin: create vouchers
exports.adminCreate = async (req, res) => {
  const discountPercent = Number(req.body?.discountPercent ?? 10);
  const expiresInDays = Number(req.body?.expiresInDays ?? 30);
  const quantity = Math.min(100, Math.max(1, Number(req.body?.quantity ?? 1)));

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 90) {
    return res.status(400).json({ message: "Giảm % không hợp lệ (1–90)." });
  }
  if (!Number.isFinite(expiresInDays) || expiresInDays <= 0 || expiresInDays > 3650) {
    return res.status(400).json({ message: "expiresInDays không hợp lệ." });
  }

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const items = [];
  for (let i = 0; i < quantity; i++) {
    // đảm bảo unique: thử lại nếu trùng
    let code;
    while (true) {
      code = genCode();
      const exists = await Voucher.exists({ code });
      if (!exists) break;
    }

    const doc = await Voucher.create({ code, discountPercent, expiresAt });

    const link = buildVoucherLink(code);
    const qrDataUrl = await generateQrDataUrl(link);

    items.push({
      code: doc.code,
      discountPercent: doc.discountPercent,
      expiresAt: doc.expiresAt,
      redeemedAt: doc.redeemedAt,
      link,
      qrDataUrl,
    });
  }

  return res.json({ items });
};

// Store: check voucher (PIN đã check bằng middleware storeAuth)
exports.storeCheck = async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();

  const v = await Voucher.findOne({ code }).lean();
  if (!v) return res.status(404).json({ message: "Voucher không tồn tại." });
  if (v.expiresAt && new Date(v.expiresAt).getTime() < Date.now()) return res.status(410).json({ message: "Voucher đã hết hạn." });
  if (v.redeemedAt) return res.status(409).json({ message: "Voucher đã được sử dụng." });

  return res.json({ discountPercent: v.discountPercent });
};

// Store: redeem 1 lần (atomic)
exports.storeRedeem = async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const amount = Number(req.body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Số tiền không hợp lệ." });
  }

  const now = new Date();

  // Atomic: chỉ update nếu chưa redeem và chưa hết hạn
  const updated = await Voucher.findOneAndUpdate(
    {
      code,
      redeemedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: { redeemedAt: now, redeemedAmount: amount },
    },
    { new: true }
  ).lean();

  if (!updated) {
    // phân loại lỗi cho UX
    const v = await Voucher.findOne({ code }).lean();
    if (!v) return res.status(404).json({ message: "Voucher không tồn tại." });
    if (v.expiresAt && new Date(v.expiresAt).getTime() < Date.now()) return res.status(410).json({ message: "Voucher đã hết hạn." });
    if (v.redeemedAt) return res.status(409).json({ message: "Voucher đã được sử dụng." });
    return res.status(400).json({ message: "Không redeem được voucher." });
  }

  // Log
  await VoucherRedeem.create({ code, amount, redeemedAt: now });

  return res.json({ ok: true, redeemedAt: updated.redeemedAt });
};
