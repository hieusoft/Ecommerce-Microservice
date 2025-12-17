const rabbit = require("../config/rabbitmq");
const OrderModel = require("../models/orderModel");
const orderService = require("./orderService");

async function startConsumer() {
  const queues = ["payment.success_q", "payment.failed_q"];

  for (const queue of queues) {
    rabbit.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const orderData = msg;

        console.log(`Received message from ${queue}:`, orderData);
        const { orderId, status } = orderData;
        if (orderId && status) {
          let newStatus = status === "SUCCESS" ? "Paid" : "Cancelled";

          const orderRecord = await orderService.getOrderById(orderId);

          if (!orderRecord) {
            throw new Error(`Order with ID ${orderId} not found`);
          }


          await OrderModel.updateOrder({
            order_id: orderRecord.order_id,
            status: newStatus,
          });

          const payload = {
            OrderId: orderRecord.order_id,
            OrderCode: orderRecord.order_code,
            UserId: orderRecord.user_id,
            TotalPrice: orderRecord.total_price,
            Discount: orderRecord.discount,
            CouponCode: orderRecord.coupon_code,
            VatAmount: orderRecord.vat_amount,
            ShippingFee: orderRecord.shipping_fee,
            Message: orderRecord.message,
            Status: newStatus,
            Description: orderRecord.description,
            DeliveryDate: orderRecord.delivery_date,
            DeliveryTime: orderRecord.delivery_time,
            CreatedAt: orderRecord.created_at,
            UpdatedAt: orderRecord.updated_at,
            Items: orderRecord.items.map(item => ({
              OrderItemId: item.order_item_id,
              OrderId: item.order_id,
              BouquetId: item.bouquet_id,
              BouquetName: item.bouquet_name,
              Quantity: item.quantity,
              Price: item.price
            }))
          };

          if (status === "SUCCESS") {
            rabbit.publish("order_events", "order.paid", payload);

            setTimeout(() => {
              rabbit.publish("order_events", "order.delivery", payload);
            }, 60 * 1000);
          } else {
            rabbit.publish("order_events", "order.cancelled", payload);
          }

          console.log(`Order ${orderId} updated to status: ${newStatus}`);
        }

        if (rabbit.ack) rabbit.ack(msg);
      } catch (err) {
        console.error(`Error processing message from ${queue}:`, err);
        if (rabbit.nack) rabbit.nack(msg, false, false);
      }
    });
  }

  console.log("RabbitMQ consumer started for queues:", queues);
}

module.exports = { startConsumer };
