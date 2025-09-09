const usersModel = require('../models/usersModel');
const productModel = require('../models/proudctsModel');

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

async function viewCart(req, res) {
    const cart = await usersModel.getCart(req.session.userId);
    // Join with product details from MySQL
    const products = await productModel.index();
    const detailed = cart.map(item => {
        const p = products.find(pr => String(pr.product_id) === String(item.productId));
        return {
            productId: item.productId,
            quantity: item.quantity,
            product: p || null
        };
    });
    const total = detailed.reduce((sum, it) => sum + (it.product ? (Number(it.product.price) * it.quantity) : 0), 0);
    return res.render('pages/cart', {
        title: 'Your Cart',
        items: detailed,
        total,
        isAuthenticated: req.session && req.session.user ? true : false,
        user: req.session && req.session.user ? req.session.user : null
    });
}

async function addToCart(req, res) {
    console.log('BODY RECEIVED:', req.body);
    const { productId, quantity } = req.body;
    if (!productId) return res.redirect('/products');
    const qty = Math.max(1, parseInt(quantity || '1', 10));
    await usersModel.addCartItem(req.session.userId, String(productId), qty);
    // AJAX support
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        const cart = await usersModel.getCart(req.session.userId);
        const count = cart.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
        return res.json({ ok: true, count });
    }
    return res.redirect('/cart');
}

async function removeFromCart(req, res) {
    const { productId } = req.body;
    if (productId) {
        await usersModel.removeCartItem(req.session.userId, String(productId));
    }
    return res.redirect('/cart');
}

async function clearCart(req, res) {
    await usersModel.clearCart(req.session.userId);
    return res.redirect('/cart');
}



async function updateCartItem(req, res) {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId || isNaN(qty) || qty < 0) {
        return res.status(400).json({ ok: false, message: 'Invalid product or quantity.' });
    }

    await usersModel.setCartItemQuantity(req.session.userId, productId, qty);

    // After updating, fetch fresh cart data to send back for UI updates
    const cart = await usersModel.getCart(req.session.userId);
    const products = await productModel.index(); // This matches your existing logic

    const detailedCart = cart.map(item => {
        const productDetails = products.find(p => String(p.product_id) === String(item.productId));
        return { ...item, product: productDetails || null };
    });

    const updatedItem = detailedCart.find(i => i.productId === productId);
    const itemTotal = updatedItem ? (Number(updatedItem.product.price) * updatedItem.quantity) : 0;
    const cartTotal = detailedCart.reduce((sum, item) => sum + (item.product ? (Number(item.product.price) * item.quantity) : 0), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
        ok: true,
        cartCount,
        itemTotal,
        cartTotal,
        removed: qty === 0
    });
}

module.exports = {
    requireAuth,
    viewCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItem
};


