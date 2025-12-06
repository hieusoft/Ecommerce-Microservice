using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public  interface IRedisService
    {
        Task SetStringAsync(string key, string value, TimeSpan? expiry = null);
      
        Task<string?> GetStringAsync(string key);

        Task DeleteAsync(string key);

        Task<bool> ExistsAsync(string key);

        Task<long> IncrementAsync(string key, TimeSpan? expiry = null);

        Task SetObjectAsync<T>(string key, T data, TimeSpan? expiry = null);

        Task<T?> GetObjectAsync<T>(string key);

        Task<string[]> SearchKeysAsync(string pattern);
    }
}
