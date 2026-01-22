const { customAlphabet } = require("nanoid");
const QRCode = require("qrcode");

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const genCode = customAlphabet(alphabet, 10);

function buildVoucherLink(code) {
  const base = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
  // link trỏ về UI cửa hàng
  return `${base}/check/${code}`;
}

async function generateQrDataUrl(link) {
  return QRCode.toDataURL(link, { errorCorrectionLevel: "M" });
}

module.exports = {
  genCode,
  buildVoucherLink,
  generateQrDataUrl,
};
