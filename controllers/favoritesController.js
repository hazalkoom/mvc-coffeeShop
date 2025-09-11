const usersModel = require('../models/usersModel');
const productModel = require('../models/proudctsModel');

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

async function listFavorites(req, res) {
    const favoriteIds = await usersModel.getFavorites(req.session.userId);
    const allProducts = await productModel.index();
    const items = allProducts.filter(p => favoriteIds.includes(String(p.product_id)));
    return res.render('pages/favorites', {
        title: 'Your Favorites',
        items,
        isAuthenticated: req.session && req.session.user ? true : false,
        user: req.session && req.session.user ? req.session.user : null
    });
}

async function toggleFavorite(req, res) {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ ok: false, message: 'Missing productId' });
        const { isFavorite } = await usersModel.toggleFavorite(req.session.userId, String(productId));

        // Update header counts
        const favorites = await usersModel.getFavorites(req.session.userId);
        const favoritesCount = favorites.length;

        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.json({ ok: true, isFavorite, favoritesCount });
        }
        return res.redirect('/favorites');
    } catch (err) {
        console.error('Toggle favorite error:', err);
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.status(500).json({ ok: false });
        }
        req.session.error = 'Error updating favorites';
        return res.redirect('/favorites');
    }
}

module.exports = {
    requireAuth,
    listFavorites,
    toggleFavorite
};


