module.exports = function storeAuth(req, res, next) {
  const pin = req.body?.pin;
  const STORE_PIN = process.env.STORE_PIN;

  if (!STORE_PIN)
    return res
      .status(500)
      .json({ message: 'Missing STORE_PIN in server env.' });
  if (!pin || pin !== STORE_PIN)
    return res.status(401).json({ message: 'PIN không đúng.' });

  next();
};
