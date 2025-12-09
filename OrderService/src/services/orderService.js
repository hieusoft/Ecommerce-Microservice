const rabbit = require("../config/rabbitmq");
const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");

function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


async function recalcTotalPrice(orderId) {
  const items = await orderItemModel.getOrderItems(orderId);

  let total = 0;
  for (const item of items) {
    total += Number(item.price) * Number(item.quantity);
  }

  await orderModel.updateOrder({
    order_id: orderId,
    total_price: total,
  });

  return total;
}


async function createOrder(orderData) {
  const orderCode = generateRandomCode();
  
  let totalPrice = 0;
  const items = [];

  for (const item of orderData.items) {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (isNaN(price) || isNaN(quantity)) {
      throw new Error("Invalid item price or quantity");
    }

    totalPrice += price * quantity;

    items.push({
      bouquet_id: item.bouquet_id,
      quantity,
      price,
    });
  }


  const order = await orderModel.createOrder(
    Number(orderData.user_id),
    orderCode,
    totalPrice,
    orderData.description
  );


  for (const item of items) {
    await orderItemModel.addOrderItem(
      order.order_id,
      item.bouquet_id,
      item.quantity,
      item.price
    );
  }
  if (orderData.coupon_code) {
    
  await orderModel.updateOrder({
    order_id: orderId,
    total_price: totalPrice,
  });
  msg = {
    orderId: order.order_id,
    amount: totalPrice,
    converted_amount: totalPrice,
    currency: "VND",
    provider: orderData.provider,
    description: order.description,
  };
  rabbit.publish("order_events", "order.created", msg);
  return {
    ...order,
    items,
    total_price: totalPrice,
  };
}


async function getAllOrders(query) {
    return await orderModel.getAllOrdersWithQuery(query);
}



async function getOrderById(orderId) {
  return await orderModel.getOrderById(orderId);
}
async function getOrdersByUserId(userId, query) {
  return await orderModel.getOrdersByUserId(userId,query);
}

async function updateOrder(order_id, updateData) {
  const order = await orderModel.getOrderById(order_id);
  if (!order) throw new Error("Order not found");

  const updated = await orderModel.updateOrder({
    order_id,
    order_code: updateData.order_code,
    status: updateData.status,
    description: updateData.description,
    total_price: order.total_price, 
  });

  return updated;
}

async function deleteOrder(orderId) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  return await orderModel.deleteOrder(orderId);
}


async function addOrderItem(orderId, itemData) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const item = await orderItemModel.addOrderItem(
    orderId,
    itemData.bouquet_id,
    Number(itemData.quantity),
    Number(itemData.price)
  );

  const newTotal = await recalcTotalPrice(orderId);

  return {
    message: "Order item added",
    item,
    total_price: newTotal,
  };
}


async function getOrderItems(orderId) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  return await orderItemModel.getOrderItems(orderId);
}


async function updateOrderItem(orderId, orderItemId, itemData) {
  orderItemId = Number(orderItemId);

  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const items = await orderItemModel.getOrderItems(orderId);
  const exists = items.find((i) => i.order_item_id === orderItemId);

  if (!exists) throw new Error("Order item not found");

  const updatedItem = await orderItemModel.updateOrderItem(
    orderItemId,
    Number(itemData.quantity),
    Number(itemData.price)
  );

  const newTotal = await recalcTotalPrice(orderId);

  return {
    message: "Order item updated",
    item: updatedItem,
    total_price: newTotal,
  };
}

async function deleteOrderItem(orderId, orderItemId) {
  orderItemId = Number(orderItemId);

  const order = await orderModel.getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const items = await orderItemModel.getOrderItems(orderId);
  const exists = items.find((i) => i.order_item_id === orderItemId);

  if (!exists) throw new Error("Order item not found");

  await orderItemModel.deleteOrderItem(orderItemId);

  const newTotal = await recalcTotalPrice(orderId);
  console.log("Order item deleted", newTotal);
  return {
    message: "Order item deleted",
    total_price: newTotal,
  };
}

// ----------------------------------

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
  deleteOrder,
  addOrderItem,
  getOrderItems,
  updateOrderItem,
  deleteOrderItem,
};
