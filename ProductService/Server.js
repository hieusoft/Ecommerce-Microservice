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

global.rabbitService = new RabbitMqService(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');

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

        // Setup RabbitMQ với global instance
        await global.rabbitService.declareExchange('bouquetExchange', 'direct');
        await global.rabbitService.declareQueueAndBind('bouquetQueue', 'bouquetExchange', [
            'createBouquet',
            'updateBouquet',
            'deleteBouquet'
        ]);
        console.log('✓ RabbitMQ configured');

        app.use('/api/bouquets', BouquetRoutes);
        app.use('/api/flowers', FlowerRoutes);
        app.use('/api/occasions', OccasionRoutes);
        app.use('/api/greetings', GreetingRoutes);

        swaggerDocs(app);

        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('✗ Server startup failed:', err);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    try {
        await global.rabbitService.close();
        await mongoose.connection.close();
        console.log('✓ Cleanup complete');
        process.exit(0);
    } catch (err) {
        console.error('✗ Error during shutdown:', err);
        process.exit(1);
    }
});

startServer();