const connection = require('./mySqlConnection');

// Dashboard Statistics
async function getDashboardStats() {
    return new Promise((resolve, reject) => {
        const queries = {
            totalProducts: "SELECT COUNT(*) as count FROM products",
            totalOrders: "SELECT COUNT(*) as count FROM orders",
            totalRevenue: "SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled'",
            pendingOrders: "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
            categoryStats: "SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC LIMIT 5",
            revenueByMonth: `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(total_amount) as revenue 
                FROM orders 
                WHERE status != 'cancelled' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `
        };

        const stats = {};
        let completedQueries = 0;
        const totalQueries = Object.keys(queries).length;

        for (const [key, query] of Object.entries(queries)) {
            connection.query(query, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                stats[key] = result;
                completedQueries++;
                
                if (completedQueries === totalQueries) {
                    resolve(stats);
                }
            });
        }
    });
}

// Recent Products
async function getRecentProducts(limit = 5) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM products ORDER BY created_at DESC LIMIT ?", 
            [limit], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

// Recent Orders
async function getRecentOrders(limit = 10) {
    return new Promise((resolve, reject) => {
        connection.query(`
            SELECT 
                o.*,
                GROUP_CONCAT(oi.product_name SEPARATOR ', ') as product_names,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            GROUP BY o.order_id
            ORDER BY o.created_at DESC 
            LIMIT ?
        `, [limit], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

// Products Management
async function getProducts(page = 1, limit = 10, category = '', search = '') {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        let query = "SELECT * FROM products WHERE 1=1";
        const params = [];

        if (category) {
            query += " AND category = ?";
            params.push(category);
        }

        if (search) {
            query += " AND (product_name LIKE ? OR brand LIKE ? OR country LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += " ORDER BY product_id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function getProductsCount(category = '', search = '') {
    return new Promise((resolve, reject) => {
        let query = "SELECT COUNT(*) as count FROM products WHERE 1=1";
        const params = [];

        if (category) {
            query += " AND category = ?";
            params.push(category);
        }

        if (search) {
            query += " AND (product_name LIKE ? OR brand LIKE ? OR country LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result[0].count);
            } else {
                reject(error);
            }
        });
    });
}

async function getProductById(productId) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM products WHERE product_id = ?", 
            [productId], 
            (error, result) => {
                if (!error) {
                    resolve(result[0] || null);
                } else {
                    reject(error);
                }
            }
        );
    });
}

async function addProduct(productData) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO products 
            (product_name, brand, category, country, price, image_url, image_small_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            productData.product_name,
            productData.brand,
            productData.category,
            productData.country,
            productData.price,
            productData.image_url,
            productData.image_small_url
        ];

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function updateProduct(productId, productData) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE products 
            SET product_name = ?, brand = ?, category = ?, country = ?, 
                price = ?, image_url = ?, image_small_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
        `;
        const params = [
            productData.product_name,
            productData.brand,
            productData.category,
            productData.country,
            productData.price,
            productData.image_url,
            productData.image_small_url,
            productId
        ];

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        // First delete related reviews
        connection.query(
            "DELETE FROM reviews WHERE product_id = ?", 
            [productId], 
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                // Then delete the product
                connection.query(
                    "DELETE FROM products WHERE product_id = ?", 
                    [productId], 
                    (error, result) => {
                        if (!error) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
            }
        );
    });
}

async function getProductReviews(productId) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", 
            [productId], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

// Categories Management
async function getCategories() {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM categories WHERE is_active = 1 ORDER BY category_name", 
            [], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

async function getAllCategories() {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT *, (SELECT COUNT(*) FROM products WHERE category = categories.category_name) as product_count FROM categories ORDER BY category_name", 
            [], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

async function toggleCategoryStatus(categoryId) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE categories SET is_active = !is_active WHERE category_id = ?", 
            [categoryId], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

// Orders Management
async function getOrders(page = 1, limit = 10, status = '') {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        let query = `
            SELECT 
                o.*,
                GROUP_CONCAT(oi.product_name SEPARATOR ', ') as product_names,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
        `;
        const params = [];

        if (status) {
            query += " WHERE o.status = ?";
            params.push(status);
        }

        query += " GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function getOrdersCount(status = '') {
    return new Promise((resolve, reject) => {
        let query = "SELECT COUNT(*) as count FROM orders";
        const params = [];

        if (status) {
            query += " WHERE status = ?";
            params.push(status);
        }

        connection.query(query, params, (error, result) => {
            if (!error) {
                resolve(result[0].count);
            } else {
                reject(error);
            }
        });
    });
}

async function getOrderById(orderId) {
    return new Promise((resolve, reject) => {
        connection.query(`
            SELECT 
                o.*,
                oi.id as item_id,
                oi.product_id,
                oi.product_name,
                oi.unit_price,
                oi.quantity,
                oi.line_total
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.order_id = ?
            ORDER BY oi.id
        `, [orderId], (error, result) => {
            if (!error) {
                if (result.length === 0) {
                    resolve(null);
                    return;
                }

                // Group the results
                const order = {
                    order_id: result[0].order_id,
                    user_id: result[0].user_id,
                    status: result[0].status,
                    total_amount: result[0].total_amount,
                    shipping_name: result[0].shipping_name,
                    shipping_phone: result[0].shipping_phone,
                    address_line1: result[0].address_line1,
                    address_line2: result[0].address_line2,
                    city: result[0].city,
                    state: result[0].state,
                    postal_code: result[0].postal_code,
                    country: result[0].country,
                    created_at: result[0].created_at,
                    items: result.map(row => ({
                        item_id: row.item_id,
                        product_id: row.product_id,
                        product_name: row.product_name,
                        unit_price: row.unit_price,
                        quantity: row.quantity,
                        line_total: row.line_total
                    })).filter(item => item.item_id)
                };

                resolve(order);
            } else {
                reject(error);
            }
        });
    });
}

async function updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE orders SET status = ? WHERE order_id = ?", 
            [status, orderId], 
            (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });
}

// Legacy function for backward compatibility
async function adminIndex() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM products ORDER BY product_id DESC", [], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

module.exports = {
    getDashboardStats,
    getRecentProducts,
    getRecentOrders,
    getProducts,
    getProductsCount,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductReviews,
    getCategories,
    getAllCategories,
    toggleCategoryStatus,
    getOrders,
    getOrdersCount,
    getOrderById,
    updateOrderStatus,
    adminIndex // Keep for backward compatibility
};