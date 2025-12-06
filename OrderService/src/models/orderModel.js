const { pool, poolConnect } = require('../config/db');


async function createOrder(user_id, order_code,total_price, description) {
    await poolConnect;

    const result = await pool.request()
        .input('user_id', user_id)
        .input('order_code', order_code)
        .input('total_price', total_price)
        .input('description', description || '')
        .query(`
            INSERT INTO Orders (user_id, order_code,total_price, description)
            OUTPUT INSERTED.*
            VALUES (@user_id, @order_code,@total_price, @description)
        `);
    return result.recordset[0];
}

async function updateOrderCode(order_id, order_code) {
    await poolConnect;
    await pool.request()
        .input('order_id', order_id)
        .input('order_code', order_code)
        .query(`
            UPDATE Orders
            SET order_code = @order_code
            WHERE order_id = @order_id
        `);
}
async function updateOrderTotal(order_id, total_price) {
    await poolConnect;
    await pool.request()
        .input('order_id', order_id)
        .input('total_price', total_price)
        .query(`
            UPDATE Orders
            SET total_price = @total_price
            WHERE order_id = @order_id
        `);
}
async function getAllOrders() {
    await poolConnect;
    const result = await pool.request()
        .query(`SELECT * FROM Orders ORDER BY created_at DESC`);
    return result.recordset;
}
async function getOrdersByUserId(user_id) {
     await poolConnect;
    const result = await pool.request()
        .input('user_id', user_id)
        .query(`SELECT * FROM Orders WHERE user_id = @user_id`);
    return result.recordset[0];
}
async function getOrderById(order_id) {
    await poolConnect;
    const result = await pool.request()
        .input('order_id', order_id)
        .query(`SELECT * FROM Orders WHERE order_id = @order_id`);
    return result.recordset[0];
}


async function updateOrder({
    order_id,
    order_code,
    total_price,
    status,
    description
}) {
    await poolConnect;

    console.log('Updating order:', order_id, order_code, total_price, status, description);

    const result = await pool.request()
        .input('order_id', order_id)
        .input('order_code', order_code)
        .input('total_price', total_price)
        .input('status', status)
        .input('description', description)
        .query(`
            UPDATE Orders
            SET 
                order_code = COALESCE(@order_code, order_code),
                total_price = COALESCE(@total_price, total_price),
                status = COALESCE(@status, status),
                description = COALESCE(@description, description),
                updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE order_id = @order_id
        `);

    return result.recordset[0];
}


async function deleteOrder(order_id) {
    await poolConnect;
    await pool.request()
        .input('order_id', order_id)
        .query(`DELETE FROM Orders WHERE order_id = @order_id`);
}

async function applyCoupon(order_id, discountAmount) {
    await poolConnect;
    await pool.request()
        .input('order_id', order_id)
        .input('discountAmount', discountAmount)
        .query(`
            UPDATE Orders
            SET total_price = total_price - @discountAmount
            WHERE order_id = @order_id
        `);
}

module.exports = {
    createOrder,
    updateOrderCode,
    getAllOrders,
    getOrdersByUserId,
    updateOrderTotal,
    getOrderById,
    updateOrder,
    deleteOrder,
    applyCoupon
};
