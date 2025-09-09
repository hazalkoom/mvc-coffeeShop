const connection = require("./mySqlConnection");

// Create a new review
async function createReview(reviewData) {
    return new Promise((resolve, reject) => {
        const { userId, productId, rating, comment, userName, userEmail } = reviewData;
        const sql = `INSERT INTO reviews (user_id, product_id, rating, comment, user_name, user_email, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        
        connection.query(sql, [userId, productId, rating, comment, userName, userEmail], (error, result) => {
            if (!error) {
                resolve({ id: result.insertId, ...reviewData });
            } else {
                reject(error);
            }
        });
    });
}

// Get reviews for a specific product
async function getReviewsByProduct(productId, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reviews 
                     WHERE product_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?`;
        
        connection.query(sql, [productId, limit, offset], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                // If table doesn't exist, return empty array
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log('Reviews table not found, returning empty reviews array');
                    resolve([]);
                } else {
                    reject(error);
                }
            }
        });
    });
}

// Get all reviews for a product (for rating calculation)
async function getAllReviewsByProduct(productId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT rating FROM reviews WHERE product_id = ?`;
        
        connection.query(sql, [productId], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

// Get review by ID
async function getReviewById(reviewId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reviews WHERE review_id = ?`;
        
        connection.query(sql, [reviewId], (error, result) => {
            if (!error) {
                resolve(result[0]);
            } else {
                reject(error);
            }
        });
    });
}

// Update a review
async function updateReview(reviewId, updates) {
    return new Promise((resolve, reject) => {
        const { rating, comment } = updates;
        const sql = `UPDATE reviews 
                     SET rating = ?, comment = ?, updated_at = NOW() 
                     WHERE review_id = ?`;
        
        connection.query(sql, [rating, comment, reviewId], (error, result) => {
            if (!error) {
                resolve({ id: reviewId, ...updates });
            } else {
                reject(error);
            }
        });
    });
}

// Delete a review
async function deleteReview(reviewId) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM reviews WHERE review_id = ?`;
        
        connection.query(sql, [reviewId], (error, result) => {
            if (!error) {
                resolve(result.affectedRows > 0);
            } else {
                reject(error);
            }
        });
    });
}

// Check if user has already reviewed a product
async function hasUserReviewedProduct(userId, productId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ?`;
        
        connection.query(sql, [userId, productId], (error, result) => {
            if (!error) {
                resolve(result.length > 0);
            } else {
                // If table doesn't exist, return false (no reviews exist)
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log('Reviews table not found, returning false for user review check');
                    resolve(false);
                } else {
                    reject(error);
                }
            }
        });
    });
}

// Get user's review for a specific product
async function getUserReviewForProduct(userId, productId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reviews WHERE user_id = ? AND product_id = ?`;
        
        connection.query(sql, [userId, productId], (error, result) => {
            if (!error) {
                resolve(result[0] || null);
            } else {
                // If table doesn't exist, return null (no user review)
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log('Reviews table not found, returning null for user review');
                    resolve(null);
                } else {
                    reject(error);
                }
            }
        });
    });
}

// Calculate average rating for a product
async function getProductAverageRating(productId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT AVG(rating) as average, COUNT(*) as count FROM reviews WHERE product_id = ?`;
        
        connection.query(sql, [productId], (error, result) => {
            if (!error) {
                const avg = result[0].average ? parseFloat(result[0].average).toFixed(1) : 0;
                resolve({
                    average: parseFloat(avg),
                    count: result[0].count
                });
            } else {
                // If table doesn't exist, return default values
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log('Reviews table not found, returning default rating values');
                    resolve({
                        average: 0,
                        count: 0
                    });
                } else {
                    reject(error);
                }
            }
        });
    });
}

// Get recent reviews (for admin dashboard)
async function getRecentReviews(limit = 10) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.*, p.product_name 
                     FROM reviews r 
                     JOIN products p ON r.product_id = p.product_id 
                     ORDER BY r.created_at DESC 
                     LIMIT ?`;
        
        connection.query(sql, [limit], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

// Get reviews by user
async function getReviewsByUser(userId, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.*, p.product_name, p.product_image 
                     FROM reviews r 
                     JOIN products p ON r.product_id = p.product_id 
                     WHERE r.user_id = ? 
                     ORDER BY r.created_at DESC 
                     LIMIT ? OFFSET ?`;
        
        connection.query(sql, [userId, limit, offset], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

module.exports = {
    createReview,
    getReviewsByProduct,
    getAllReviewsByProduct,
    getReviewById,
    updateReview,
    deleteReview,
    hasUserReviewedProduct,
    getUserReviewForProduct,
    getProductAverageRating,
    getRecentReviews,
    getReviewsByUser
};
