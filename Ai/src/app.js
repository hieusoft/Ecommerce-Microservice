import express from 'express';
import cors from 'cors';
import { config } from './core/config.js';
import { connectDB } from './core/database.js';
import chatRoutes from './api/chat.route.js';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot Service API',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/chat', chatRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});


const startServer = async () => {
  try {
  
    await connectDB();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server is running on port ${config.PORT}`);
      console.log(`📝 API available at http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

