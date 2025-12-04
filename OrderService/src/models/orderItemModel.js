const { pool, poolConnect } = require('../config/db');

async function addOrderItem(order_id, bouquet_id, quantity, price) {
    await poolConnect;
    const result = await pool.request()
        .input('order_id', order_id)
        .input('bouquet_id', bouquet_id)
        .input('quantity', quantity)
        .input('price', price)
        .query(`
            INSERT INTO OrderItems (order_id, bouquet_id, quantity, price)
            OUTPUT INSERTED.*
            VALUES (@order_id, @bouquet_id, @quantity, @price)
        `);
    return result.recordset[0];
}


async function getOrderItems(order_id) {
    await poolConnect;
    const result = await pool.request()
        .input('order_id', order_id)
        .query(`SELECT * FROM OrderItems WHERE order_id = @order_id`);
    return result.recordset;
}


async function updateOrderItem(order_item_id, quantity, price) {
    await poolConnect;
    const result = await pool.request()
        .input('order_item_id', order_item_id)
        .input('quantity', quantity)
        .input('price', price)
        .query(`
            UPDATE OrderItems
            SET quantity = COALESCE(@quantity, quantity),
                price = COALESCE(@price, price)
            OUTPUT INSERTED.*
            WHERE order_item_id = @order_item_id
        `);
    return result.recordset[0];
}


async function deleteOrderItem(order_item_id) {
    await poolConnect;
    await pool.request()
        .input('order_item_id', order_item_id)
        .query(`DELETE FROM OrderItems WHERE order_item_id = @order_item_id`);
}

module.exports = {
    addOrderItem,
    getOrderItems,
    updateOrderItem,
    deleteOrderItem
};
