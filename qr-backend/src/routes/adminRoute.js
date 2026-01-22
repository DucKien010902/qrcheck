const express = require("express");
const router = express.Router();

const adminAuth = require("../middlewares/adminAuth");
const AdminController = require("../app/controllers/AdminController");
const VoucherController = require("../app/controllers/VoucherController");

router.post("/login", AdminController.login);
router.post("/logout", AdminController.logout);

router.get("/vouchers", adminAuth, VoucherController.adminList);
router.post("/vouchers", adminAuth, VoucherController.adminCreate);

module.exports = router;
