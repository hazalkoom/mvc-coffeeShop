const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Apply admin middleware to all admin routes
router.use('/admin', adminController.requireAdmin);

// Admin Dashboard
router.get('/admin', adminController.adminIndex);

// Products Management
router.get('/admin/products', adminController.showProducts);
router.get('/admin/products/add', adminController.showAddProduct);
router.post('/admin/products/add', adminController.addProduct);
router.get('/admin/products/:id', adminController.showProductDetails);
router.get('/admin/products/:id/edit', adminController.showEditProduct);
router.post('/admin/products/:id/edit', adminController.updateProduct);
router.post('/admin/products/:id/delete', adminController.deleteProduct);

// Orders Management
router.get('/admin/orders', adminController.showOrders);
router.get('/admin/orders/:id', adminController.showOrderDetails);
router.post('/admin/orders/:id/status', adminController.updateOrderStatus);

// Categories Management
router.get('/admin/categories', adminController.showCategories);
router.post('/admin/categories/:id/toggle', adminController.toggleCategoryStatus);

module.exports = router;