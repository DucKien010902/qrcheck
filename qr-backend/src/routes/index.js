const express = require("express");
const router = express.Router();

const adminRoute = require("./adminRoute");
const storeRoute = require("./storeRoute");

router.use("/admin", adminRoute);
router.use("/store", storeRoute);

module.exports = router;
