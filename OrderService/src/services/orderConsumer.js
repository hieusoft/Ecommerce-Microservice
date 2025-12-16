const rabbit = require("../config/rabbitmq");
const OrderModel = require("../models/orderModel");
const orderService = require("./orderService")
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

          const orderRecord = await orderService.getOrderById(orderId)
         

          if (!orderRecord) {
            throw new Error(`Order with ID ${orderId} not found`);
          }
          await OrderModel.updateOrder({
            order_id: orderRecord.order_id,
            status: newStatus,
          });
          if (status === "SUCCESS") {
            rabbit.publish("order_events", "order.paid", orderRecord);
            
            setTimeout(() => {
              rabbit.publish("order_events", "order.delivery", orderRecord);
            }, 60 * 1000);
          } else {
            rabbit.publish("order_events", "order.cancelled", orderRecord );
          }
          console.log(`Order ${orderId} updated to status: ${status}`);
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
