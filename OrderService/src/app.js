const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const rabbit  = require("./config/rabbitmq");
const app = express();
const { startConsumer } = require('./services/orderConsumer');

startConsumer();
(async () => {
  await rabbit.setupRabbit();
})();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('OrderService is running ✅'));

module.exports = app;
