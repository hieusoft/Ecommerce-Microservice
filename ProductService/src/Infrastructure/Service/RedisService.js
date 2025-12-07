const IRedisService = require("../../Application/Interfaces/IRedisService");
const Redis = require("ioredis");

class RedisService extends IRedisService {
  constructor(url) {
    super();
    this.redis = new Redis(url);
  }

  async setStringAsync(key, value, expiryInSeconds = null) {
    if (expiryInSeconds) {
      await this.redis.set(key, value, "EX", expiryInSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async getStringAsync(key) {
    return await this.redis.get(key);
  }

  async deleteAsync(key) {
    await this.redis.del(key);
  }

  async existsAsync(key) {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async incrementAsync(key, expiryInSeconds = null) {
    const value = await this.redis.incr(key);
    if (expiryInSeconds) {
      await this.redis.expire(key, expiryInSeconds);
    }
    return value;
  }

  async setObjectAsync(key, data, expiryInSeconds = null) {
    const json = JSON.stringify(data);
    if (expiryInSeconds) {
      await this.redis.set(key, json, "EX", expiryInSeconds);
    } else {
      await this.redis.set(key, json);
    }
  }

  async getObjectAsync(key) {
    const json = await this.redis.get(key);
    if (!json) return null;
    return JSON.parse(json);
  }

  async searchKeysAsync(pattern) {
    return await this.redis.keys(pattern);
  }
}

module.exports = RedisService;
