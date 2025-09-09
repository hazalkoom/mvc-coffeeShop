// route/web.js (fixed and improved)
const express = require('express');
const webRouter = express.Router();
// Removed app = express() - don't create new app instance in routes

/* ------------- controllers ------------------- */
const productController = require('../controllers/productsController');

// Moved multer configuration (you can keep this for future file uploads)
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/uploads/");
    },
    filename: (req, file, cb) => {
        if (file) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }
});

const upload = multer({
    storage: storage
});

/* -------------- route roles ------------------------ */

// Homepage
webRouter.get('/', productController.index);

// All products page
webRouter.get('/products', productController.allProducts);

// Individual product detail page
webRouter.get('/products/:id', productController.productDetail);

// Review routes
webRouter.post('/reviews/submit', productController.submitReview);
webRouter.post('/reviews/:reviewId/update', productController.updateReview);
webRouter.get('/reviews/:reviewId/delete', productController.deleteReview);

// About page (placeholder)
webRouter.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About Us',
        isAuthenticated: req.session && req.session.user ? true : false,
        user: req.session && req.session.user ? req.session.user : null
    });
});

// Contact page (placeholder)
webRouter.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us',
        isAuthenticated: req.session && req.session.user ? true : false,
        user: req.session && req.session.user ? req.session.user : null
    });
});

module.exports = webRouter;