const orderService = require('../services/orderService');
const jwtUserService = require('../services/jwtUserService');
async function createOrder(req, res) {
    try {
        // Lấy user_id từ token
        const user_id = jwtUserService.getUserIdFromToken(req);
        console.log('User ID from token:', user_id);

        // Gán user_id vào body trước khi tạo order
        const orderData = {
            ...req.body,
            user_id
        };

        const order = await orderService.createOrder(orderData);
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Failed to create order' });
    }
}


async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}

async function updateOrder(req, res) {
    try {
        const updated = await orderService.updateOrder(req.params.orderId, req.body);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Failed to update order' });
    }
}

async function deleteOrder(req, res) {
    try {
        await orderService.deleteOrder(req.params.orderId);
        console.log('Deleted order item with ID:', req.params.orderId);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}

async function addOrderItem(req, res) {
    try {
        const item = await orderService.addOrderItem(req.params.orderId, req.body);
        res.status(201).json(item);
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}
async function getOrderItems(req, res) {
    try {
        const items = await orderService.getOrderItems(req.params.orderId);
        res.json(items);
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}

async function updateOrderItem(req, res) {
    try {
        const updated = await orderService.updateOrderItem(
            req.params.orderId,
            req.params.orderItemId,
            req.body
        );
        res.json(updated);
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
}

async function deleteOrderItem(req, res) {
    try {
        await orderService.deleteOrderItem(req.params.orderId, req.params.orderItemId);
       
        res.json({ message: 'Order item deleted' });
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: err.message || 'Failed to delete order' });
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
    deleteOrderItem
};
