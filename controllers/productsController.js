const productModel = require("../models/proudctsModel");
const reviewsModel = require("../models/reviewsModel");
const path = require("path");
const {unlink} = require("fs");

const index = async (req, res) => {
    try {
        const [products, categories] = await Promise.all([
            productModel.getFeatured(), // Get featured products for homepage
            productModel.getCategories() // Get categories for homepage
        ]);

        // Get ratings for each product
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const rating = await reviewsModel.getProductAverageRating(product.product_id);
                return { ...product, rating };
            })
        );
        
        res.render("pages/index", { 
            title: "Welcome to CoffeeShop",
            products: productsWithRatings, 
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

        // Get ratings for each product
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const rating = await reviewsModel.getProductAverageRating(product.product_id);
                return { ...product, rating };
            })
        );

        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        // If this is an AJAX request for partial update
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.render('partials/products-grid', { products: productsWithRatings }, (err, html) => {
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
            products: productsWithRatings, 
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

        // Get reviews and rating for this product
        const [reviews, ratingSummary, userReview] = await Promise.all([
            reviewsModel.getReviewsByProduct(id, 5, 0),
            reviewsModel.getProductAverageRating(id),
            req.session && req.session.user ? 
                reviewsModel.getUserReviewForProduct(req.session.userId, id) : null
        ]);
        
        res.render("pages/product-detail", { 
            title: product.product_name + " - CoffeeShop",
            product,
            reviews,
            ratingSummary,
            userReview,
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

// Submit a review
const submitReview = async (req, res) => {
    try {
        // Check authentication
        if (!req.session || !req.session.user) {
            req.session.error = 'You must be logged in to submit a review';
            return res.redirect('/login');
        }

        const { productId, rating, comment } = req.body;
        const userId = req.session.userId;

        // Validate input
        if (!productId || !rating) {
            req.session.error = 'Product ID and rating are required';
            return res.redirect(`/products/${productId}`);
        }

        if (rating < 1 || rating > 5) {
            req.session.error = 'Rating must be between 1 and 5';
            return res.redirect(`/products/${productId}`);
        }

        // Check if product exists
        const product = await productModel.getById(productId);
        if (!product) {
            req.session.error = 'Product not found';
            return res.redirect('/products');
        }

        // Check if user has already reviewed this product
        const existingReview = await reviewsModel.hasUserReviewedProduct(userId, productId);
        if (existingReview) {
            req.session.error = 'You have already reviewed this product';
            return res.redirect(`/products/${productId}`);
        }

        // Create the review
        const reviewData = {
            userId: userId,
            productId: productId,
            rating: parseInt(rating),
            comment: comment ? comment.trim() : '',
            userName: req.session.user.first_name + ' ' + req.session.user.last_name,
            userEmail: req.session.user.email
        };

        await reviewsModel.createReview(reviewData);
        req.session.success = 'Review submitted successfully!';
        res.redirect(`/products/${productId}`);

    } catch (error) {
        console.error('Submit review error:', error);
        req.session.error = 'Error submitting review. Please try again.';
        res.redirect(`/products/${req.body.productId || '/products'}`);
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        // Check authentication
        if (!req.session || !req.session.user) {
            req.session.error = 'Authentication required';
            return res.redirect('/login');
        }

        const { reviewId } = req.params;
        const { rating, comment, productId } = req.body;
        const userId = req.session.userId;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            req.session.error = 'Rating must be between 1 and 5';
            return res.redirect(`/products/${productId}`);
        }

        // Get the review
        const review = await reviewsModel.getReviewById(reviewId);
        if (!review) {
            req.session.error = 'Review not found';
            return res.redirect('/products');
        }

        // Check if user owns this review
        if (review.user_id != userId) {
            req.session.error = 'You can only update your own reviews';
            return res.redirect(`/products/${productId}`);
        }

        // Update the review
        await reviewsModel.updateReview(reviewId, {
            rating: parseInt(rating),
            comment: comment ? comment.trim() : ''
        });

        req.session.success = 'Review updated successfully!';
        res.redirect(`/products/${productId}`);

    } catch (error) {
        console.error('Update review error:', error);
        req.session.error = 'Error updating review. Please try again.';
        res.redirect(`/products/${req.body.productId || '/products'}`);
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        // Check authentication
        if (!req.session || !req.session.user) {
            req.session.error = 'Authentication required';
            return res.redirect('/login');
        }

        const { reviewId } = req.params;
        const { productId } = req.query;
        const userId = req.session.userId;

        // Get the review
        const review = await reviewsModel.getReviewById(reviewId);
        if (!review) {
            req.session.error = 'Review not found';
            return res.redirect('/products');
        }

        // Check if user owns this review
        if (review.user_id != userId) {
            req.session.error = 'You can only delete your own reviews';
            return res.redirect(`/products/${productId}`);
        }

        // Delete the review
        await reviewsModel.deleteReview(reviewId);
        req.session.success = 'Review deleted successfully!';
        res.redirect(`/products/${productId}`);

    } catch (error) {
        console.error('Delete review error:', error);
        req.session.error = 'Error deleting review. Please try again.';
        res.redirect(`/products/${req.query.productId || '/products'}`);
    }
};

module.exports = {
    index,
    allProducts,
    productDetail,
    submitReview,
    updateReview,
    deleteReview
}