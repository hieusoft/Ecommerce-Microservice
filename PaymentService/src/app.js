const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const { startConsumer } = require("./services/payment.consumer");
const rabbit  = require("./events/rabbitmq");
const app = express();
app.use(express.json());

app.use("/api/payments", paymentRoutes);
(async () => {
  await rabbit.setupRabbit();

  await rabbit.consume("payment.success_q", async (msg) => {
    console.log("Handle payment success:", msg);
  });

  await rabbit.consume("payment.fail_q", async (msg) => {
    console.log("Handle payment fail:", msg);
  });
})();


startConsumer();
module.exports = app;
