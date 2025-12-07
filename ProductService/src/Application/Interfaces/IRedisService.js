class IRedisService {

  async setStringAsync(key, value, expiryInSeconds = null) {
    throw new Error("Method not implemented");
  }

  async getStringAsync(key) {
    throw new Error("Method not implemented");
  }

  async deleteAsync(key) {
    throw new Error("Method not implemented");
  }

  async existsAsync(key) {
    throw new Error("Method not implemented");
  }

  async incrementAsync(key, expiryInSeconds = null) {
    throw new Error("Method not implemented");
  }

 
  async setObjectAsync(key, data, expiryInSeconds = null) {
    throw new Error("Method not implemented");
  }

  async getObjectAsync(key) {
    throw new Error("Method not implemented");
  }

  async searchKeysAsync(pattern) {
    throw new Error("Method not implemented");
  }
}

module.exports = IRedisService;
