const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.post('/', orderController.createOrder);

router.get('/', orderController.getAllOrders);

router.get('/analytics', orderController.queryAnalytics);

router.get('/:orderId', orderController.getOrderById);

router.put('/:orderId', orderController.updateOrder);

router.delete('/:orderId', orderController.deleteOrder);

router.post('/:orderId/items', orderController.addOrderItem);

router.get('/:orderId/items', orderController.getOrderItems);

router.put('/:orderId/items/:orderItemId', orderController.updateOrderItem);



module.exports = router;
