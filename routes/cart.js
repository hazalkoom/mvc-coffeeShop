const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.requireAuth, cartController.viewCart);
router.post('/cart/add', cartController.requireAuth, cartController.addToCart);
router.post('/cart/remove', cartController.requireAuth, cartController.removeFromCart);
router.post('/cart/clear', cartController.requireAuth, cartController.clearCart);
router.post('/cart/update', cartController.requireAuth, cartController.updateCartItem);

module.exports = router;







