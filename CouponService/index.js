require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const RabbitMqService = require('./src/Service/RabbitMQService.js');
const CouponConsumer = require('./src/Events/CouponConsumer.js');
const CouponRoutes = require('./src/Routes/CouponRoutes');

const app = express();
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
    }
};

async function startServer() {
    try {
        const dbPool = await sql.connect(dbConfig);
        console.log('Connected to SQL Server');
        app.set('dbPool', dbPool);

        const rabbitMQService = new RabbitMqService(
            process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
        );
        console.log('RabbitMQ service initialized');

        await rabbitMQService.declareExchange('coupon_events', 'direct');
        await rabbitMQService.declareQueueAndBind('coupon.created_q', 'coupon_events', 'coupon.created');
        await rabbitMQService.declareQueueAndBind('coupon.validated_q', 'coupon_events', 'coupon.validated');

        app.use('/api/coupons', CouponRoutes(rabbitMQService));


        const couponConsumer = new CouponConsumer(rabbitMQService, dbPool);
        await couponConsumer.start();

        const PORT = process.env.PORT || 5001;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        const gracefulShutdown = async () => {
            server.close(async () => {
                try {
                    if (rabbitMQService) {
                        await rabbitMQService.close();
                        console.log('RabbitMQ connection closed');
                    }
                    if (dbPool) {
                        await dbPool.close();
                        console.log('Database connection closed');
                    }
                    process.exit(0);
                } catch (error) {
                    console.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (err) {
        console.error('ailed to start server:', err);
    }
}


startServer();

module.exports = app;
