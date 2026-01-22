exports.login = async (req, res) => {
  const { pin } = req.body || {};
  const ADMIN_PIN = process.env.ADMIN_PIN;

  if (!ADMIN_PIN) {
    return res.status(500).json({ message: "Missing ADMIN_PIN in server env." });
  }

  if (!pin || pin !== ADMIN_PIN) {
    return res.status(401).json({ message: "PIN admin không đúng." });
  }

  // ✅ SET COOKIE CHUẨN
  res.cookie("admin_auth", "true", {
    httpOnly: true,
    secure: true,        // HTTPS (Render)
    sameSite: "none",    // Cross-site (Vercel → Render)
    path: "/",           // 🔥 BẮT BUỘC
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true });
};

exports.logout = async (_req, res) => {
  res.clearCookie("admin_auth", {
    path: "/",
    sameSite: "none",
    secure: true,
  });
  return res.json({ ok: true });
};
