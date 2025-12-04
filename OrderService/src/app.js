const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const rabbit  = require("./config/rabbitmq");
const app = express();

(async () => {
  await rabbit.setupRabbit();
})();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('OrderService is running ✅'));

module.exports = app;
