
const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672/";

let connection = null;
let channel = null;

async function connect() {
  if (channel) return channel; 

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on("close", () => {
    console.error("⚠️ RabbitMQ connection closed. Reconnecting...");
    connection = null;
    channel = null;
    setTimeout(connect, 3000);
  });

  connection.on("error", (err) => {
    console.error("❌ RabbitMQ error:", err.message);
  });

  console.log("🐇 Connected to RabbitMQ");
  return channel;
}


async function assertExchangeQueue(exchange, queue, routingKey = "", type = "direct") {
  const ch = await connect();

  await ch.assertExchange(exchange, type, { durable: true });
  await ch.assertQueue(queue, { durable: true });
  await ch.bindQueue(queue, exchange, routingKey);

  console.log(`🔗 Queue '${queue}' bound to exchange '${exchange}' with key '${routingKey}'`);
}


async function publish(exchange, routingKey, msg) {
  const ch = await connect();
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)), { persistent: true });
  console.log(`📤 Published to ${exchange}:${routingKey}`, msg);
}

async function consume(queue, handler) {
  const ch = await connect();

  await ch.assertQueue(queue, { durable: true });

  ch.consume(
    queue,
    async (msg) => {
      if (!msg) return;
      const content = JSON.parse(msg.content.toString());
      console.log("📥 Received:", content);

      try {
        await handler(content);
        ch.ack(msg);
      } catch (err) {
        console.error("❌ Error processing message:", err);
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );

  console.log(`👂 Listening on queue: ${queue}`);
}


async function setupRabbit() {

  await assertExchangeQueue("order_events", "order.created_q", "order.created");
  console.log("✅ RabbitMQ setup completed");
}

module.exports = {
  connect,
  assertExchangeQueue,
  publish,
  consume,
  setupRabbit,
};