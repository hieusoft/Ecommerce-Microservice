const Redis = require("ioredis");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

class RedisService {
   constructor() {
    // Kết nối Redis bằng URL
    this.client = new Redis(REDIS_URL);

    this.client.on("connect", () => {
      console.log("Redis connected successfully!");
    });

    this.client.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }
  
  async setStringAsync(key, value, expiryInSeconds = null) {
    if (expiryInSeconds) {
      await this.client.set(key, value, "EX", expiryInSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async getStringAsync(key) {
    return await this.client.get(key);
  }

  async deleteAsync(key) {
    return await this.client.del(key);
  }

  async existsAsync(key) {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async incrementAsync(key, expiryInSeconds = null) {
    const value = await this.client.incr(key);
    if (expiryInSeconds) {
      await this.client.expire(key, expiryInSeconds);
    }
    return value;
  }

  async setObjectAsync(key, data, expiryInSeconds = null) {
    const value = JSON.stringify(data);
    await this.setStringAsync(key, value, expiryInSeconds);
  }

  async getObjectAsync(key) {
    const data = await this.getStringAsync(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error("Redis parse error:", err);
      return null;
    }
  }

  async searchKeysAsync(pattern) {
    return await this.client.keys(pattern);
  }
}

module.exports = new RedisService();
