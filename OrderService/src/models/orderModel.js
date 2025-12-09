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
async function getAllOrdersWithQuery(query) {
    await poolConnect;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const status = query.status || null;
    const search = query.search || null;
    const minPrice = query.minPrice || null;
    const maxPrice = query.maxPrice || null;
    const fromDate = query.fromDate || null;
    const toDate = query.toDate || null;

    const sortBy = query.sortBy || "created_at";
    const orderBy = query.order === "asc" ? "ASC" : "DESC";

    let where = "WHERE 1 = 1";
    const request = pool.request();

    if (status) {
        where += " AND status = @status";
        request.input("status", status);
    }

    if (search) {
        where += " AND order_code LIKE '%' + @search + '%'";
        request.input("search", search);
    }

    if (minPrice) {
        where += " AND total_price >= @minPrice";
        request.input("minPrice", minPrice);
    }

    if (maxPrice) {
        where += " AND total_price <= @maxPrice";
        request.input("maxPrice", maxPrice);
    }

    if (fromDate) {
        where += " AND created_at >= @fromDate";
        request.input("fromDate", fromDate);
    }

    if (toDate) {
        where += " AND created_at <= @toDate";
        request.input("toDate", toDate);
    }

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM Orders
        ${where}
    `;

    const countResult = await request.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const dataQuery = `
        SELECT *
        FROM Orders
        ${where}
        ORDER BY ${sortBy} ${orderBy}
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
    `;

    const dataResult = await request.query(dataQuery);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        data: dataResult.recordset
    };
}


async function getOrdersByUserId(user_id, query) {
    await poolConnect;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const status = query.status || null;
    const search = query.search || null;
    const minPrice = query.minPrice || null;
    const maxPrice = query.maxPrice || null;
    const from = query.from || null;
    const to = query.to || null;

    const sortBy = query.sortBy || "created_at";
    const order = query.order === "asc" ? "ASC" : "DESC";

    // Build dynamic WHERE
    let where = `WHERE user_id = @user_id `;
    let request = pool.request().input("user_id", user_id);

    if (status) {
        where += ` AND status = @status`;
        request.input("status", status);
    }

    if (search) {
        where += ` AND order_code LIKE '%' + @search + '%'`;
        request.input("search", search);
    }

    if (minPrice) {
        where += ` AND total_price >= @minPrice`;
        request.input("minPrice", minPrice);
    }

    if (maxPrice) {
        where += ` AND total_price <= @maxPrice`;
        request.input("maxPrice", maxPrice);
    }

    if (from) {
        where += ` AND created_at >= @from`;
        request.input("from", from);
    }

    if (to) {
        where += ` AND created_at <= @to`;
        request.input("to", to);
    }

    // Query count
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM Orders
        ${where}
    `;

    const countResult = await request.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Query data (pagination)
    const dataQuery = `
        SELECT *
        FROM Orders
        ${where}
        ORDER BY ${sortBy} ${order}
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
    `;

    const dataResult = await request.query(dataQuery);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        data: dataResult.recordset
    };
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
    getAllOrdersWithQuery,
    getOrdersByUserId,
    updateOrderTotal,
    getOrderById,
    updateOrder,
    deleteOrder,
    applyCoupon
};
