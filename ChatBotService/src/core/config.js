/** Configuration management. */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3000,

  // Database (SQL Server)
  DB_SERVER: process.env.DB_SERVER || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 1433,
  DB_NAME: process.env.DB_NAME || 'ChatbotService',
  DB_USER: process.env.DB_USER || 'sa',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  // encrypt=true khi dùng Azure SQL / SSL
  DB_ENCRYPT: (process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_DB: Number(process.env.REDIS_DB) || 0,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,

 OPENROUTER_API_KEY : process.env.OPENROUTER_API_KEY || 0
};

