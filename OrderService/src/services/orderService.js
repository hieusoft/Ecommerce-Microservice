const rabbit = require("../config/rabbitmq");
const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");
const redisService = require("../services/RedisService");
const axios = require("axios");
const crypto = require("crypto");

function generateCacheKey(prefix, query) {
  const serialized = JSON.stringify(query); // biến query thành chuỗi
  const hash = crypto.createHash("sha256").update(serialized).digest("hex");
  return `${prefix}:${hash}`;
}
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
      bouquet_id: Number(item.bouquet_id),
      quantity,
      price,
    });
  }

  let discountData = null;

  if (orderData.coupon_code) {
    discountData = await redisService.getObjectAsync(
      `coupon:validate:${orderData.coupon_code}`
    );

    if (!discountData) {
      console.log("Calling coupon validation API...");

      try {
        const response = await axios.post(
          "http://localhost:5001/api/coupons/validate",
          {
            coupon_code: orderData.coupon_code,
            user_id: Number(orderData.userId),
            total_price: totalPrice,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("Coupon API status:", response.status);

        if (!response.data || !response.data.coupon) {
          throw new Error("Invalid coupon response format");
        }

        const coupon = response.data.coupon;

        discountData = {
          valid: coupon.valid === true,
          discount_type: coupon.discount_type ?? "amount",
          discount_value: Number(coupon.discount_value ?? 0),
          min_price: Number(coupon.min_price ?? 0),
          coupon_id: Number(coupon.coupon_id),
        };
      } catch (err) {
        throw new Error(
          err.response?.data?.error || "Coupon validation failed"
        );
      }
    }
  }
  let discountAmount = 0;

  if (discountData?.valid) {
    if (discountData.discount_type === "amount") {
      discountAmount = discountData.discount_value;
    } else if (discountData.discount_type === "percent") {
      discountAmount = Math.floor(
        (totalPrice * discountData.discount_value) / 100
      );
    }
  }

  totalPrice = Math.max(totalPrice - discountAmount, 0);
  const order = await orderModel.createOrder(
    orderCode,
    Number(orderData.userId),
    Number(orderData.recipient_id),
    totalPrice,
    orderData.description || "",
    orderData.delivery_date || null,
    orderData.delivery_time || null
  );
  for (const item of items) {
    await orderItemModel.addOrderItem(
      Number(order.order_id),
      item.bouquet_id,
      item.quantity,
      item.price
    );
  }
  if (orderData.coupon_code && discountData?.valid) {
    await orderModel.updateOrderCoupon({
      order_id: Number(order.order_id),
      coupon_code: orderData.coupon_code,
      discountAmount: discountAmount,
    });

    const msg = {
      coupon_id: discountData.coupon_id,
      order_id: Number(order.order_id),
      user_id: Number(orderData.userId),
    };

    rabbit.publish("order_events", "order.coupon", msg);
  }
  rabbit.publish("order_events", "order.created", {
    orderId: Number(order.order_id),
    amount: totalPrice,
    currency: "VND",
    provider: orderData.provider,
  });
  return {
    ...order,
    items,
    total_price: totalPrice,
    discount: discountAmount,
  };
}

async function getAllOrders(query) {
  const cacheKey = generateCacheKey("orders:list", query);
  const cached = await redisService.getObjectAsync(cacheKey);
  if (cached) {
    return cached;
  }
  const data = await orderModel.getAllOrdersWithQuery(query);
  await redisService.setObjectAsync(cacheKey, data, 60);

  return data;
}


async function getOrderById(orderId) {
  return await orderModel.getOrderById(orderId);
}
async function getOrdersByUserId(userId, query) {
  return await orderModel.getOrdersByUserId(userId, query);
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
