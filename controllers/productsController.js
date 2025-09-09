const productModel = require("../models/proudctsModel");
const path = require("path");
const {unlink} = require("fs");

const index = async (req, res) => {
    try {
        const [products, categories] = await Promise.all([
            productModel.getFeatured(), // Get featured products for homepage
            productModel.getCategories() // Get categories for homepage
        ]);
        
        res.render("pages/index", { 
            title: "Welcome to CoffeeShop",
            products, 
            categories,
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session && req.session.user ? req.session.user : null
        });
    } catch (error) {
        console.error("Error loading homepage:", error);
        res.status(500).render("pages/error", { 
            message: "Error loading homepage",
            error: error
        });
    }
};

const allProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const pageSize = 8;
        const offset = (page - 1) * pageSize;

        const [total, products, categories] = await Promise.all([
            productModel.countProducts({ category, search }),
            productModel.getProductsPaged({ category, search, limit: pageSize, offset }),
            productModel.getCategories()
        ]);

        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        // If this is an AJAX request for partial update
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.render('partials/products-grid', { products }, (err, html) => {
                if (err) {
                    console.error('Error rendering products partial:', err);
                    return res.status(500).json({ error: 'Failed to render products.' });
                }
                // Also render pagination partial
                return res.render('partials/pagination', { page, totalPages, category, search }, (perr, phtml) => {
                    if (perr) {
                        console.error('Error rendering pagination partial:', perr);
                        return res.status(500).json({ error: 'Failed to render pagination.' });
                    }
                    return res.json({ html, pagination: phtml, page, totalPages });
                });
            });
        }

        res.render("pages/index", { 
            title: "Our Products",
            products, 
            categories,
            currentCategory: category || '',
            searchTerm: search || '',
            page,
            totalPages,
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session && req.session.user ? req.session.user : null
        });
    } catch (error) {
        console.error("Error loading products:", error);
        res.status(500).render("pages/error", { 
            message: "Error loading products",
            error: error
        });
    }
};

const productDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.getById(id);
        
        if (!product) {
            return res.status(404).render("pages/error", { 
                message: "Product not found",
                error: "The product you're looking for doesn't exist."
            });
        }
        
        res.render("pages/product-detail", { 
            title: product.product_name + " - CoffeeShop",
            product,
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session && req.session.user ? req.session.user : null
        });
    } catch (error) {
        console.error("Error loading product detail:", error);
        res.status(500).render("pages/error", { 
            message: "Error loading product details",
            error: error
        });
    }
};

module.exports = {
    index,
    allProducts,
    productDetail
}