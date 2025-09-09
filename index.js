const express = require('express');
const session = require("express-session");
const app = express();
const path = require('path');
require('dotenv').config();
const { connectMongo } = require('./models/mongoConnection');


/* ------------- public folder ---------------- */
app.use(express.static(__dirname + '/public'));
/* ------------- view engine ------------------ */
app.set('view engine', 'ejs');
/* -------------- using form data -------------- */
app.use(express.urlencoded({extended: true}));
app.use(express.json());
/* ------------- session ---------------------- */
app.use(session({
    secret: 'thisismyapplicationtoday',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 3, // three days to be expired
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
    
    // Calculate cart count for authenticated users
    if (req.session && req.session.userId) {
        try {
            const usersModel = require('./models/usersModel');
            const cart = await usersModel.getCart(req.session.userId);
            res.locals.cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        } catch (error) {
            console.error('Error getting cart count:', error);
            res.locals.cartCount = 0;
        }
    } else {
        res.locals.cartCount = 0;
    }
    
    next();
});
/* ------------- router ----------------------- */
const webRouter = require('./routes/web');
const usersRouter = require('./routes/users');
const cartRouter = require('./routes/cart');

// Initialize Mongo, then mount routes and start server
(async () => {
    try {
        await connectMongo();
        console.log('MongoDB connected');

        app.use(webRouter);
        app.use(usersRouter);
        app.use(cartRouter);

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