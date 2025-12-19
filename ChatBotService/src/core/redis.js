/** Redis connection for context management. */
import { createClient } from 'redis';
import { config } from './config.js';

let redisClient = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      database: config.REDIS_DB,
      password: config.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
};

export const getUserContext = async (userId) => {
  try {
    const client = await getRedisClient();
    const data = await client.get(`context:${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
};

export const setUserContext = async (userId, context, ttl = 3600) => {
  try {
    const client = await getRedisClient();
    await client.setEx(`context:${userId}`, ttl, JSON.stringify(context));
  } catch (error) {
    console.error('Error setting user context:', error);
  }
};

export const deleteUserContext = async (userId) => {
  try {
    const client = await getRedisClient();
    await client.del(`context:${userId}`);
  } catch (error) {
    console.error('Error deleting user context:', error);
  }
};


