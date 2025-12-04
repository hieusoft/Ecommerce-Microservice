const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const { startConsumer } = require("./services/payment.consumer");
const rabbit  = require("./events/rabbitmq");
const app = express();
app.use(express.json());

app.use("/api/payments", paymentRoutes);
(async () => {
  await rabbit.setupRabbit();
})();


startConsumer();
module.exports = app;
