const connection = require('./mySqlConnection');

async function createOrder({ userId, shipping, items }) {
    return new Promise((resolve, reject) => {
        connection.getConnection((err, conn) => {
            if (err) return reject(err);
            conn.beginTransaction(async (txErr) => {
                if (txErr) {
                    conn.release();
                    return reject(txErr);
                }

                const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);

                const orderSql = `INSERT INTO orders 
                    (user_id, status, total_amount, shipping_name, shipping_phone, address_line1, address_line2, city, state, postal_code, country, created_at)
                    VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
                const orderParams = [
                    userId,
                    totalAmount,
                    `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim(),
                    shipping.phone || '',
                    shipping.address_line1 || '',
                    shipping.address_line2 || '',
                    shipping.city || '',
                    shipping.state || '',
                    shipping.postal_code || '',
                    shipping.country || ''
                ];

                conn.query(orderSql, orderParams, (orderErr, orderRes) => {
                    if (orderErr) {
                        return conn.rollback(() => { conn.release(); reject(orderErr); });
                    }
                    const orderId = orderRes.insertId;

                    const itemSql = `INSERT INTO order_items 
                        (order_id, product_id, product_name, unit_price, quantity, line_total)
                        VALUES ?`;
                    const values = items.map(it => [
                        orderId,
                        it.product_id,
                        it.product_name,
                        Number(it.price),
                        Number(it.quantity),
                        Number(it.price) * Number(it.quantity)
                    ]);

                    if (values.length === 0) {
                        return conn.rollback(() => { conn.release(); reject(new Error('No items to insert')); });
                    }

                    conn.query(itemSql, [values], (itemErr) => {
                        if (itemErr) {
                            return conn.rollback(() => { conn.release(); reject(itemErr); });
                        }

                        conn.commit((commitErr) => {
                            if (commitErr) {
                                return conn.rollback(() => { conn.release(); reject(commitErr); });
                            }
                            conn.release();
                            resolve({ orderId, totalAmount });
                        });
                    });
                });
            });
        });
    });
}

async function getRecentOrdersByUser(userId, limit = 5) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT o.order_id, o.status, o.total_amount, o.created_at
                     FROM orders o
                     WHERE o.user_id = ?
                     ORDER BY o.created_at DESC
                     LIMIT ?`;
        connection.query(sql, [userId, limit], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function getOrdersByUser(userId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT o.order_id, o.status, o.total_amount, o.created_at
                     FROM orders o
                     WHERE o.user_id = ?
                     ORDER BY o.created_at DESC`;
        connection.query(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function getOrderWithItems(orderId, userId) {
    return new Promise((resolve, reject) => {
        const sqlOrder = `SELECT * FROM orders WHERE order_id = ? AND user_id = ?`;
        connection.query(sqlOrder, [orderId, userId], (err, orders) => {
            if (err) return reject(err);
            const order = orders && orders[0];
            if (!order) return resolve(null);
            const sqlItems = `SELECT * FROM order_items WHERE order_id = ?`;
            connection.query(sqlItems, [orderId], (iErr, items) => {
                if (iErr) return reject(iErr);
                resolve({ order, items });
            });
        });
    });
}

async function getUserTotalSpent(userId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ?`;
        connection.query(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(Number(rows[0].total) || 0);
        });
    });
}

module.exports = {
    createOrder,
    getRecentOrdersByUser,
    getOrdersByUser,
    getOrderWithItems,
    getUserTotalSpent
};


