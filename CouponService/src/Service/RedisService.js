const Redis = require("ioredis");

class RedisService {
  constructor() {
    this.client = new Redis({
      host: "127.0.0.1",
      port: 6379,
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
