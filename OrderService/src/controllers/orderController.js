const orderService = require('../services/orderService');
const { getUserFromToken } = require('../services/jwtUserService');


function getAuthUser(req, res) {
    try {
        return getUserFromToken(req); 
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
        return null;
    }
}

async function createOrder(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const { userId } = user;

        const orderData = {
            ...req.body,
            userId
        };

        const order = await orderService.createOrder(orderData);
        return res.status(201).json(order);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to create order'
        });
    }
}

async function getAllOrders(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const { userId, roles } = user;
        const query = req.query;

        const result = roles.includes("Admin")
            ? await orderService.getAllOrders(query)
            : await orderService.getOrdersByUserId(userId, query);

        return res.json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

async function getOrderById(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.json(order);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to get order'
        });
    }
}

async function updateOrder(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const updated = await orderService.updateOrder(
            req.params.orderId,
            req.body
        );

        return res.json(updated);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to update order'
        });
    }
}

async function deleteOrder(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        await orderService.deleteOrder(req.params.orderId);

        return res.json({ message: 'Order deleted' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to delete order'
        });
    }
}

async function addOrderItem(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const item = await orderService.addOrderItem(
            req.params.orderId,
            req.body
        );

        return res.status(201).json(item);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to add order item'
        });
    }
}

async function getOrderItems(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const items = await orderService.getOrderItems(req.params.orderId);
        return res.json(items);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to get order items'
        });
    }
}

async function updateOrderItem(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const updated = await orderService.updateOrderItem(
            req.params.orderId,
            req.params.orderItemId,
            req.body
        );

        return res.json(updated);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to update order item'
        });
    }
}

async function deleteOrderItem(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;

        const result = await orderService.deleteOrderItem(
            req.params.orderId,
            req.params.orderItemId
        );

        return res.json({
            message: result.message,
            total_price: result.total_price
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to delete order item'
        });
    }
}

async function queryAnalytics(req, res) {
    try {
        const user = getAuthUser(req, res);
        if (!user) return;
        if (!user.roles.includes("Manager") && !user.roles.includes("Admin")) {
            return res.status(403).json({
                message: "Insufficent permissions"
            });
        }
        console.log(req);
        const result = await orderService.queryAnalytics(
            req.query.date_range
        );

        return res.json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || 'Failed to delete order item'
        });
    }
}


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    addOrderItem,
    getOrderItems,
    updateOrderItem,
    deleteOrderItem,
    queryAnalytics,
};
