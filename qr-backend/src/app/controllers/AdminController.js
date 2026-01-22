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
  const isProd = process.env.NODE_ENV === "production";

res.cookie("admin_auth", "true", {
  httpOnly: true,
  secure: isProd,                 // ✅ PROD true, LOCAL false
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});


  return res.json({ ok: true });
};

exports.logout = async (_req, res) => {
  res.clearCookie("admin_auth", {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

  return res.json({ ok: true });
};
