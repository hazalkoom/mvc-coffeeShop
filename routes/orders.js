const express = require('express');
const router = express.Router();
const ordersModel = require('../models/ordersModel');

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

router.get('/orders', requireAuth, async (req, res) => {
    const orders = await ordersModel.getOrdersByUser(req.session.userId);
    res.render('pages/orders', {
        title: 'My Orders',
        orders,
        isAuthenticated: true,
        user: req.session.user
    });
});

router.get('/orders/:id', requireAuth, async (req, res) => {
    const orderId = req.params.id;
    const data = await ordersModel.getOrderWithItems(orderId, req.session.userId);
    if (!data) return res.redirect('/orders');
    res.render('pages/order-detail', {
        title: `Order #${orderId}`,
        order: data.order,
        items: data.items,
        isAuthenticated: true,
        user: req.session.user
    });
});

module.exports = router;


