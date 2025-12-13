const rabbit = require("../config/rabbitmq");
const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");
const redisService = require("../services/redisService");
const axios = require("axios");
const crypto = require("crypto");

function generateCacheKey(prefix, query) {
  const serialized = JSON.stringify(query); 
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
  console.log("Order received:", orderData);

  const orderCode = generateRandomCode();
  let totalPrice = 0;
  const items = [];

  
  if (!orderData.cartItems || !Array.isArray(orderData.cartItems)) {
    throw new Error("cartItems is required.");
  }

  for (const item of orderData.cartItems) {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (isNaN(price) || isNaN(quantity)) {
      throw new Error("Invalid item price or quantity");
    }

    totalPrice += price * quantity;

    items.push({
      bouquet_id: item.id,     
      quantity,
      price
    });
  }
 
  let discountData = null;
console.log("Order received:")
  if (orderData.couponCode) {
    discountData = await redisService.getObjectAsync(
      `coupon:validate:${orderData.userId}:${orderData.couponCode}`
    );

    if (!discountData) {
      try {
        const response = await axios.post(
          "http://couponservice:8086/api/coupons/validate",
          {
            coupon_code: orderData.couponCode,
            user_id: Number(orderData.userId),
            total_price: totalPrice
          }
        );

        const coupon = response.data?.data;
        if (!coupon) throw new Error("Invalid coupon response format");

        discountData = {
          valid: coupon.valid === true,
          discount_type: coupon.discount_type ?? "amount",
          discount_value: Number(coupon.discount_value ?? 0),
          min_price: Number(coupon.min_price ?? 0),
          coupon_id: Number(coupon.coupon_id)
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
  console.log(discountData)
  totalPrice = Math.max(totalPrice - discountAmount, 0);


  totalPrice += Number(orderData.tax ?? 0);
  totalPrice += Number(orderData.fee ?? 0);

  console.log("TOtal",totalPrice)

const order = await orderModel.createOrder(
  orderCode,
  Number(orderData.userId),
  totalPrice,
  orderData.tax,
  orderData.fee,
  orderData.giftMessage || "",      
  orderData.description || null,   
  orderData.deliveryDate || null,   
  orderData.deliveryTime || null,   
  discountAmount,                   
  orderData.couponCode || null 
);

  for (const item of items) {
    await orderItemModel.addOrderItem(
      Number(order.order_id),
      item.bouquet_id,
      item.quantity,
      item.price
    );
  }

  if (orderData.couponCode && discountData?.valid) {
    rabbit.publish("order_events", "order.coupon", {
      coupon_id: discountData.coupon_id,
      order_id: Number(order.order_id),
      user_id: Number(orderData.userId)
    });
  }


  rabbit.publish("order_events", "order.created", {
    orderId: Number(order.order_id),
    userId: orderData.userId,
    amount: totalPrice,
    currency: orderData.currency || "USD",
    provider: orderData.paymentMethod || "cod"
  });


  return {
    ...order,
    items,
    total_price: totalPrice,
    discount: discountAmount
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
