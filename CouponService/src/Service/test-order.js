const RabbitMqService = require('./RabbitMqService');

async function sendTestOrder() {
    const rabbit = new RabbitMqService('amqp://guest:guest@localhost:5672');

    const order = {
        order_id: 1003,
        user_id: 10,
        coupon_code: "ssss",
        amount: 500.000,
        items: [
            { product_id: 1, quantity: 2, price: 200 },
            { product_id: 2, quantity: 1, price: 100 }
        ]
    };

    await rabbit.declareExchange('order_events', 'direct');
    await rabbit.declareQueueAndBind('order.created_q','order_events', 'order.created');

    await rabbit.publish('order_events', 'order.created', order);

    console.log('✅ Order test sent:', order);

    await rabbit.close();
}

sendTestOrder().catch(console.error);
