const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.get('/checkout', checkoutController.requireAuth, checkoutController.showCheckout);
router.post('/checkout/confirm', checkoutController.requireAuth, checkoutController.confirmCheckout);

module.exports = router;


