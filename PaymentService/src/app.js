const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const { startConsumer } = require("./services/PaymentConsumer");
const rabbit  = require("./events/rabbitmq");
const app = express();
app.use(express.json());

app.use("/api/payments", paymentRoutes);
(async () => {
  await rabbit.setupRabbit();
})();
    console.log("Return URL:", String(process.env.VNPAY_RETURN_URL));

startConsumer();
module.exports = app;
