
const connection = require("./mySqlConnection");

async function index() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM products ORDER BY product_id DESC", [], (error, result) => {
            if(!error) {
                resolve(result);
            } else {
                reject(error);
            }
        })
    });
}

async function countProducts(filters = {}) {
    const { category, search } = filters;
    const params = [];
    let sql = "SELECT COUNT(*) as total FROM products";
    const conditions = [];

    if (category) {
        conditions.push("category = ?");
        params.push(category);
    }
    if (search) {
        conditions.push("(LOWER(product_name) LIKE ? OR LOWER(brand) LIKE ?)");
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, result) => {
            if (!error) {
                resolve(result[0].total);
            } else {
                reject(error);
            }
        });
    });
}

async function getProductsPaged({ category, search, limit, offset }) {
    const params = [];
    let sql = "SELECT * FROM products";
    const conditions = [];

    if (category) {
        conditions.push("category = ?");
        params.push(category);
    }
    if (search) {
        conditions.push("(LOWER(product_name) LIKE ? OR LOWER(brand) LIKE ?)");
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY product_id DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function getByCategory(category) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM products WHERE category = ? ORDER BY product_id DESC", [category], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    })
}

async function getFeatured() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM products ORDER BY price DESC LIMIT 8", [], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

async function getCategories() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM categories WHERE is_active = true ORDER BY category_id", [], (error, result) => {
            if (!error) {
                resolve(result);
            } else {
                reject(error)
            }
        })
    })
}



async function getById(productId) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM products WHERE product_id = ?", [productId], (error, result) => {
            if (!error) {
                resolve(result[0]);
            } else {
                reject(error);
            }
        })
    })
}

module.exports = {
    index,
    getByCategory,
    getFeatured,
    getCategories,
    getById,
    countProducts,
    getProductsPaged
}