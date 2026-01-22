exports.login = async (req, res) => {
  const { pin } = req.body || {};
  const ADMIN_PIN = process.env.ADMIN_PIN;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Missing JWT_SECRET" });
  }

  if (!pin || pin !== ADMIN_PIN) {
    return res.status(401).json({ message: "PIN admin không đúng." });
  }

  const token = require("jsonwebtoken").sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({ ok: true, token });
};

// ✅ thêm cái này
exports.logout = async (_req, res) => {
  return res.json({ ok: true });
};
