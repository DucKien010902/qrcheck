const express = require('express');
const router = express.Router();

const storeAuth = require('../middlewares/storeAuth');
const VoucherController = require('../app/controllers/VoucherController');

router.post('/vouchers/:code/check', storeAuth, VoucherController.storeCheck);
router.post('/vouchers/:code/redeem', storeAuth, VoucherController.storeRedeem);

module.exports = router;
