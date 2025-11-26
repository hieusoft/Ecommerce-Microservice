require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const BouquetRoutes = require('./src/Api/routes/BouquetRouters');
const FlowerRoutes = require('./src/Api/routes/FlowerRouters');
const OccasionRoutes = require('./src/Api/routes/OccasionRouters');
const GreetingRoutes = require('./src/Api/routes/GreetingRouters');

const RabbitMqService = require('./src/Infrastructure/Service/RabbitMQService');
const swaggerDocs = require('./src/swagger');

const app = express();
app.use(express.json());

app.use('/uploads/bouquets', express.static(path.join(__dirname, 'uploads', 'bouquets')));

app.use(cors({
    origin: '*',          
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ MongoDB connected');

        // Khởi tạo RabbitMQ service (không dùng global)
        const rabbitService = new RabbitMqService(
            process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
        );

        await rabbitService.declareExchange('bouquetExchange', 'direct');
        await rabbitService.declareQueueAndBind('bouquetQueue', 'bouquetExchange', [
            'createBouquet',
            'updateBouquet',
            'deleteBouquet'
        ]);
        console.log('✓ RabbitMQ configured');

        // Inject rabbitService vào từng route
        app.use('/api/bouquets', BouquetRoutes(rabbitService));
        app.use('/api/flowers', FlowerRoutes(rabbitService));
        app.use('/api/occasions', OccasionRoutes(rabbitService));
        app.use('/api/greetings', GreetingRoutes(rabbitService));

        swaggerDocs(app);

        const server = app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            try {
                server.close(() => {
                    console.log('✓ HTTP server closed');
                });
                
                await rabbitService.close();
                console.log('✓ RabbitMQ connection closed');
                
                await mongoose.connection.close();
                console.log('✓ MongoDB connection closed');
                
                console.log('✓ Cleanup complete');
                process.exit(0);
            } catch (err) {
                console.error('✗ Error during shutdown:', err);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (err) {
        console.error('✗ Server startup failed:', err);
        process.exit(1);
    }
}

startServer();