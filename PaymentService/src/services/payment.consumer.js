const rabbit = require("../events/rabbitmq");
const PaymentService = require("./PaymentService");

async function startConsumer() {
    const queueOrder = "order.created_q";

   
    rabbit.consume(queueOrder, async (msg) => {
        if (!msg) return;
        const orderData = msg; 

        try {
            const paymentResult = await PaymentService.createPayment(orderData);
            console.log("✅ Payment URL created:", paymentResult.data.url);
            if (rabbit.ack) rabbit.ack(msg); 
        } catch (err) {
            console.error("❌ Error creating payment:", err.message);
            if (rabbit.nack) rabbit.nack(msg, false, false);
        }
    });
}

module.exports = { startConsumer };
