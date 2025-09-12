const adminModel = require('../models/adminModel');

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    // Check if user is logged in and is admin
    if (!req.session.user) {
        return res.redirect('/login?error=login_required');
    }
    
    if (req.session.user.role !== 'admin') {
        return res.status(403).render('pages/error', { 
            message: 'Access Denied', 
            error: { message: 'You do not have permission to access this page' } 
        });
    }
    
    next();
}

// Middleware to redirect admins away from public pages
function redirectAdminFromPublic(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return res.redirect('/admin');
    }
    next();
}

// Admin Dashboard
async function adminIndex(req, res) {
    try {
        const stats = await adminModel.getDashboardStats();
        const recentProducts = await adminModel.getRecentProducts(5);
        const recentOrders = await adminModel.getRecentOrders(10);
        
        res.render('pages/admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            stats,
            recentProducts,
            recentOrders
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).render('pages/error', { message: 'Error loading admin dashboard', error });
    }
}

// Products Management
async function showProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category || '';
        const search = req.query.search || '';
        
        const products = await adminModel.getProducts(page, limit, category, search);
        const categories = await adminModel.getCategories();
        const totalProducts = await adminModel.getProductsCount(category, search);
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.render('pages/admin/manageProducts', {
            title: 'Manage Products',
            user: req.session.user,
            products,
            categories,
            currentPage: page,
            totalPages,
            category,
            search,
            limit
        });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).render('pages/error', { message: 'Error loading products', error });
    }
}

async function showAddProduct(req, res) {
    try {
        const categories = await adminModel.getCategories();
        res.render('pages/admin/addProduct', {
            title: 'Add New Product',
            user: req.session.user,
            categories
        });
    } catch (error) {
        console.error('Error loading add product form:', error);
        res.status(500).render('pages/error', { message: 'Error loading add product form', error });
    }
}

async function addProduct(req, res) {
    try {
        const productData = {
            product_name: req.body.product_name,
            brand: req.body.brand,
            category: req.body.category,
            country: req.body.country,
            price: parseFloat(req.body.price),
            image_url: req.body.image_url || null,
            image_small_url: req.body.image_small_url || null
        };

        const result = await adminModel.addProduct(productData);
        res.redirect('/admin/products?success=Product added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        const categories = await adminModel.getCategories();
        res.render('pages/admin/addProduct', {
            title: 'Add New Product',
            user: req.session.user,
            categories,
            error: 'Error adding product: ' + error.message,
            formData: req.body
        });
    }
}

async function showEditProduct(req, res) {
    try {
        const productId = req.params.id;
        const product = await adminModel.getProductById(productId);
        const categories = await adminModel.getCategories();
        
        if (!product) {
            return res.status(404).render('pages/error', { 
                message: 'Product not found', 
                error: { message: 'The product you are looking for does not exist' } 
            });
        }

        res.render('pages/admin/edit', {
            title: 'Edit Product',
            user: req.session.user,
            product,
            categories
        });
    } catch (error) {
        console.error('Error loading product for edit:', error);
        res.status(500).render('pages/error', { message: 'Error loading product', error });
    }
}

async function updateProduct(req, res) {
    try {
        const productId = req.params.id;
        const productData = {
            product_name: req.body.product_name,
            brand: req.body.brand,
            category: req.body.category,
            country: req.body.country,
            price: parseFloat(req.body.price),
            image_url: req.body.image_url || null,
            image_small_url: req.body.image_small_url || null
        };

        await adminModel.updateProduct(productId, productData);
        res.redirect('/admin/products?success=Product updated successfully');
    } catch (error) {
        console.error('Error updating product:', error);
        const product = await adminModel.getProductById(req.params.id);
        const categories = await adminModel.getCategories();
        res.render('pages/admin/edit', {
            title: 'Edit Product',
            user: req.session.user,
            product,
            categories,
            error: 'Error updating product: ' + error.message
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const productId = req.params.id;
        await adminModel.deleteProduct(productId);
        res.redirect('/admin/products?success=Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.redirect('/admin/products?error=Error deleting product');
    }
}

async function showProductDetails(req, res) {
    try {
        const productId = req.params.id;
        const product = await adminModel.getProductById(productId);
        const reviews = await adminModel.getProductReviews(productId);
        
        if (!product) {
            return res.status(404).render('pages/error', { 
                message: 'Product not found', 
                error: { message: 'The product you are looking for does not exist' } 
            });
        }

        res.render('pages/admin/details', {
            title: `Product Details - ${product.product_name}`,
            user: req.session.user,
            product,
            reviews
        });
    } catch (error) {
        console.error('Error loading product details:', error);
        res.status(500).render('pages/error', { message: 'Error loading product details', error });
    }
}

// Orders Management
async function showOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        
        const orders = await adminModel.getOrders(page, limit, status);
        const totalOrders = await adminModel.getOrdersCount(status);
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.render('pages/admin/order', {
            title: 'Manage Orders',
            user: req.session.user,
            orders,
            currentPage: page,
            totalPages,
            status,
            limit
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).render('pages/error', { message: 'Error loading orders', error });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const orderId = req.params.id;
        const newStatus = req.body.status;
        
        await adminModel.updateOrderStatus(orderId, newStatus);
        res.redirect('/admin/orders?success=Order status updated successfully');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.redirect('/admin/orders?error=Error updating order status');
    }
}

async function showOrderDetails(req, res) {
    try {
        const orderId = req.params.id;
        const order = await adminModel.getOrderById(orderId);
        
        if (!order) {
            return res.status(404).render('pages/error', { 
                message: 'Order not found', 
                error: { message: 'The order you are looking for does not exist' } 
            });
        }

        res.render('pages/admin/orderDetails', {
            title: `Order Details - #${order.order_id}`,
            user: req.session.user,
            order
        });
    } catch (error) {
        console.error('Error loading order details:', error);
        res.status(500).render('pages/error', { message: 'Error loading order details', error });
    }
}

// Categories Management
async function showCategories(req, res) {
    try {
        const categories = await adminModel.getAllCategories();
        res.render('pages/admin/categories', {
            title: 'Manage Categories',
            user: req.session.user,
            categories
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        res.status(500).render('pages/error', { message: 'Error loading categories', error });
    }
}

async function toggleCategoryStatus(req, res) {
    try {
        const categoryId = req.params.id;
        await adminModel.toggleCategoryStatus(categoryId);
        res.redirect('/admin/categories?success=Category status updated successfully');
    } catch (error) {
        console.error('Error updating category status:', error);
        res.redirect('/admin/categories?error=Error updating category status');
    }
}

module.exports = {
    requireAdmin,
    redirectAdminFromPublic,
    adminIndex,
    showProducts,
    showAddProduct,
    addProduct,
    showEditProduct,
    updateProduct,
    deleteProduct,
    showProductDetails,
    showOrders,
    updateOrderStatus,
    showOrderDetails,
    showCategories,
    toggleCategoryStatus
};