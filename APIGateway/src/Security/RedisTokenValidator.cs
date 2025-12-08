using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace src.Security
{
    public class RedisTokenValidator : DelegatingHandler
    {
        private readonly IDatabase _redis;
        private readonly string _secretKey;

        public RedisTokenValidator(IConnectionMultiplexer redis)
        {
            _redis = redis.GetDatabase();
            _secretKey = "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            if (!request.Headers.TryGetValues("Authorization", out var authHeaders))
                return Unauthorized("Missing token");

            var token = authHeaders.FirstOrDefault()?.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
                return Unauthorized("Invalid token format");

            var handler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = "AuthService",
                ValidAudience = "AuthServiceUsers",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)),
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = handler.ValidateToken(token, validationParameters, out var validatedToken);

                var userId = principal.Claims.FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier ||
                    c.Type == "nameid" ||
                    c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;
                var tokenVersion = principal.Claims.FirstOrDefault(c => c.Type == "tokenVersion")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(tokenVersion))
                    return Unauthorized("Missing claims in token");

                var redisKey = $"user:{userId}:tokenVersion";
                var storedVersion = await _redis.StringGetAsync(redisKey);

                if (storedVersion.IsNullOrEmpty)
                    return Unauthorized("Token not found in Redis");

                if (storedVersion != tokenVersion)
                    return Unauthorized("Token invalid because version changed");

                return await base.SendAsync(request, cancellationToken);
            }
            catch (SecurityTokenException ex)
            {
                return Unauthorized($"Token validation failed: {ex.Message}");
            }
            catch (Exception ex)
            {
                return Unauthorized($"Unexpected error: {ex.Message}");
            }
        }

        private HttpResponseMessage Unauthorized(string message)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new
            {
                success = false,
                message = message
            });

            return new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
        }
    }
}
