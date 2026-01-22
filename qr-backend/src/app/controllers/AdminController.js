exports.login = async (req, res) => {
  const { pin } = req.body || {};
  const ADMIN_PIN = process.env.ADMIN_PIN;

  if (!ADMIN_PIN) return res.status(500).json({ message: "Missing ADMIN_PIN in server env." });
  if (!pin || pin !== ADMIN_PIN) return res.status(401).json({ message: "PIN admin không đúng." });

  // session cookie (không maxAge => cookie theo phiên)
  res.cookie("admin_auth", "true", {
  httpOnly: true,
  secure: true,          // 🔥 BẮT BUỘC trên HTTPS
  sameSite: "none",      // 🔥 BẮT BUỘC cross-site
  maxAge: 24 * 60 * 60 * 1000, // 1 ngày
});


  return res.json({ ok: true });
};

exports.logout = async (_req, res) => {
  res.clearCookie("admin", { path: "/" });
  return res.json({ ok: true });
};
