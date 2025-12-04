const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");
const orderPublisher = require("../events/orderPublisher");
const rabbit  = require("../config/rabbitmq");
function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



async function getAllOrders() {
  return await orderModel.getAllOrders();
}

async function getOrderById(orderId) {
  return await orderModel.getOrderById(orderId);
}

async function updateOrder(order_id, updateData) {
  const order = await orderModel.getOrderById(order_id);
  if (!order) throw new Error("Order not found");

  const orderUpdated = await orderModel.updateOrder({
    order_id: order_id,
    order_code: updateData.order_code,
    total_price: updateData.total_price,
    status: updateData.status,
    description: updateData.description,
  });
  return orderUpdated;
}

async function deleteOrder(orderId) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  return await orderModel.deleteOrder(orderId);
}



async function addOrderItem(orderId, itemData) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const orderItem = await orderItemModel.addOrderItem(
    orderId,
    itemData.bouquet_id,
    itemData.quantity,
    itemData.price
  );

  return orderItem;
}

async function getOrderItems(orderId) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const items = await orderItemModel.getOrderItems(orderId);
  return items;
}

async function updateOrderItem(orderId, orderItemId, itemData) {
  orderItemId = Number(orderItemId);

  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const items = await orderItemModel.getOrderItems(orderId);

  const exists = items.find(i => i.order_item_id === orderItemId);
  if (!exists) throw new Error("Order item not found");

  const updatedItem = await orderItemModel.updateOrderItem(
    orderItemId,
    itemData.quantity,
    itemData.price
  );

  return updatedItem;
}

async function deleteOrderItem(orderId, orderItemId) {

  orderItemId = Number(orderItemId);
  const order = await orderModel.getOrderById(orderId);

  if (!order) throw new Error("Order not found");

  const item = await orderItemModel.getOrderItems(orderId);


  const exists = item.find(i => i.order_item_id === orderItemId);
  if (!exists) throw new Error("Order item not found");

  await orderItemModel.deleteOrderItem(orderItemId);
  return { message: "Order item deleted", order_item_id: orderItemId };
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
