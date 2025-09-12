const usersModel = require('../models/usersModel');
const productModel = require('../models/proudctsModel');
const ordersModel = require('../models/ordersModel');
const { sendMail, renderOrderEmail, ownerEmail } = require('../services/emailService');

// Override the owner email if needed
const OWNER_EMAIL =  process.env.OWNER_EMAIL;

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

async function showCheckout(req, res) {
    const userId = req.session.userId;
    const cart = await usersModel.getCart(userId);
    if (!cart || cart.length === 0) {
        req.session.error = 'Your cart is empty';
        return res.redirect('/cart');
    }
    const products = await productModel.index();
    const detailed = cart.map(item => {
        const p = products.find(pr => String(pr.product_id) === String(item.productId));
        return {
            product_id: p ? p.product_id : item.productId,
            product_name: p ? p.product_name : 'Unknown',
            price: p ? Number(p.price) : 0,
            quantity: item.quantity,
            product: p || null
        };
    });
    const total = detailed.reduce((sum, it) => sum + (Number(it.price) * it.quantity), 0);
    const user = await usersModel.findUserById(userId);
    res.render('pages/checkout', {
        title: 'Checkout',
        items: detailed,
        total,
        userData: user,
        isAuthenticated: true,
        user: req.session.user
    });
}

async function confirmCheckout(req, res) {
    try {
        const userId = req.session.userId;
        const user = await usersModel.findUserById(userId);
        const cart = await usersModel.getCart(userId);
        if (!cart || cart.length === 0) {
            req.session.error = 'Your cart is empty';
            return res.redirect('/cart');
        }
        const products = await productModel.index();
        const items = cart.map(item => {
            const p = products.find(pr => String(pr.product_id) === String(item.productId));
            return {
                product_id: p ? p.product_id : item.productId,
                product_name: p ? p.product_name : 'Unknown',
                price: p ? Number(p.price) : 0,
                quantity: item.quantity
            };
        });

        const shipping = {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            address_line1: user.address_line1,
            address_line2: user.address_line2,
            city: user.city,
            state: user.state,
            postal_code: user.postal_code,
            country: user.country
        };

        const { orderId, totalAmount } = await ordersModel.createOrder({ userId, shipping, items });

        // Clear cart
        await usersModel.clearCart(userId);

        // Emails - using the configured owner email
        const html = renderOrderEmail({ orderId, user, items, total: totalAmount });
        try {
            // Send notification to owner (you)
            await sendMail({ to: OWNER_EMAIL, subject: `New Order #${orderId}`, html });
            // Send confirmation to customer
            await sendMail({ to: user.email, subject: `We received your order #${orderId}`, html });
        } catch (e) {
            console.warn('Email send failed or skipped', e.message || e);
        }

        res.render('pages/order-confirmation', {
            title: 'Order Confirmed',
            orderId,
            total: totalAmount,
            isAuthenticated: true,
            user: req.session.user
        });
    } catch (err) {
        console.error('Checkout confirm error:', err);
        req.session.error = 'Could not place order. Please try again.';
        return res.redirect('/checkout');
    }
}

module.exports = {
    requireAuth,
    showCheckout,
    confirmCheckout
};