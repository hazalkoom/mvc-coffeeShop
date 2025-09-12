const express = require('express');
const session = require("express-session");
const app = express();
const path = require('path');
require('dotenv').config();
const { connectMongo } = require('./models/mongoConnection');
const helmet = require('helmet');

/* ------------- public folder ---------------- */
app.use(express.static('public', {
    dotfiles: 'ignore',
    maxAge: '1d'
}));
/* ------------- view engine ------------------ */
app.set('view engine', 'ejs');
/* -------------- using form data -------------- */
app.use(express.urlencoded({extended: true}));
app.use(express.json());
/* ------------- session ---------------------- */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true if using HTTPS
    sameSite: 'strict'
  }
}));

// auth locals for all views
app.use(async (req, res, next) => {
    res.locals.isAuthenticated = !!(req.session && req.session.user);
    res.locals.user = (req.session && req.session.user) || null;
    
    // Flash messages
    res.locals.error = req.session.error || null;
    res.locals.success = req.session.success || null;
    
    // Clear flash messages after they're used
    delete req.session.error;
    delete req.session.success;
    
    // Calculate cart and favorites counts for authenticated users
    if (req.session && req.session.userId) {
        try {
            const usersModel = require('./models/usersModel');
            const cart = await usersModel.getCart(req.session.userId);
            res.locals.cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const favorites = await usersModel.getFavorites(req.session.userId);
            res.locals.favoritesCount = favorites.length;
            res.locals.favoriteIds = favorites;
        } catch (error) {
            console.error('Error getting cart count:', error);
            res.locals.cartCount = 0;
            res.locals.favoritesCount = 0;
            res.locals.favoriteIds = [];
        }
    } else {
        res.locals.cartCount = 0;
        res.locals.favoritesCount = 0;
        res.locals.favoriteIds = [];
    }
    
    next();
});
/* ------------- router ----------------------- */
const webRouter = require('./routes/web');
const usersRouter = require('./routes/users');
const cartRouter = require('./routes/cart');
const favoritesRouter = require('./routes/favorites');
const checkoutRouter = require('./routes/checkout');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

// Initialize Mongo, then mount routes and start server
(async () => {
    try {
        await connectMongo();
        console.log('MongoDB connected');

        app.use(webRouter);
        app.use(usersRouter);
        app.use(cartRouter);
        app.use(favoritesRouter);
        app.use(checkoutRouter);
        app.use(ordersRouter);
        app.use(adminRouter);
        app.use((err, req, res, next) => {
        console.error(err.stack);
            res.status(500).send('Something went wrong!');
        });


        /* ---------------- start server --------------- */
        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.log("server start at port " + port);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
})();