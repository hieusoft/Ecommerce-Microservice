using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;

namespace src.Security
{
    public class RedisTokenValidator : DelegatingHandler
    {
        private readonly IDatabase _redis;

        public RedisTokenValidator(IConnectionMultiplexer redis)
        {
            _redis = redis.GetDatabase();
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            if (!request.Headers.TryGetValues("Authorization", out IEnumerable<string>? authHeaders))
            {
                return Unauthorized("Missing token");
            }

            var token = authHeaders.First().Replace("Bearer ", "");
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            var userId = jwt.Claims.First(x => x.Type == "nameid").Value;
            var tokenVersion = jwt.Claims.First(x => x.Type == "tokenVersion").Value;

            var redisKey = $"user:{userId}:tokenVersion";
            var storedVersion = await _redis.StringGetAsync(redisKey);

            if (storedVersion.IsNullOrEmpty)
            {
                return Unauthorized("Token not found in Redis");
            }

            if (storedVersion != tokenVersion)
            {
                return Unauthorized("Token invalid because version changed");
            }

            return await base.SendAsync(request, cancellationToken);
        }

        private HttpResponseMessage Unauthorized(string message)
        {
            return new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized)
            {
                Content = new StringContent(message)
            };
        }
    }
}
