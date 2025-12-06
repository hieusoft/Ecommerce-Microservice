using Application.Interfaces;
using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class RedisService : IRedisService
    {
        private readonly IDatabase _db;
        private readonly IConnectionMultiplexer _redis;

        public RedisService(IConnectionMultiplexer redis)
        {
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _db = redis.GetDatabase();
        }

       
        public async Task SetStringAsync(string key, string value, TimeSpan? expiry = null)
        {
            if (expiry.HasValue)
                await _db.StringSetAsync(key, value, expiry: (Expiration)expiry);
            else
                await _db.StringSetAsync(key, value);
        }

     
        public async Task<string?> GetStringAsync(string key)
        {
            var result = await _db.StringGetAsync(key);
            return result.HasValue ? result.ToString() : null;
        }

   
        public async Task DeleteAsync(string key)
        {
            await _db.KeyDeleteAsync(key);
        }

        public async Task<bool> ExistsAsync(string key)
        {
            return await _db.KeyExistsAsync(key);
        }

       
        public async Task<long> IncrementAsync(string key, TimeSpan? expiry = null)
        {
            long count = await _db.StringIncrementAsync(key);

            if (expiry.HasValue)
            {
               
                await _db.KeyExpireAsync(key, expiry);
            }

            return count;
        }

        public async Task SetObjectAsync<T>(string key, T data, TimeSpan? expiry = null)
        {
            var json = JsonConvert.SerializeObject(data);

            if (expiry.HasValue)
                await _db.StringSetAsync(key, json, expiry: (Expiration)expiry);
            else
                await _db.StringSetAsync(key, json);
        }

        public async Task<T?> GetObjectAsync<T>(string key)
        {
            var value = await _db.StringGetAsync(key);

            if (!value.HasValue)
                return default;

            return JsonConvert.DeserializeObject<T>(value!);
        }

     
        public async Task<string[]> SearchKeysAsync(string pattern)
        {
            var endpoints = _redis.GetEndPoints();
            var server = _redis.GetServer(endpoints[0]);

         
            var keys = server.Keys(pattern: pattern).Select(k => k.ToString()).ToArray();
            return await Task.FromResult(keys);
        }
    }
}
