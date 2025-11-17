// AuthService.Api/Middleware/EmailResendThrottleMiddleware.cs
using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;

public class EmailResendThrottleMiddleware
{
    private readonly RequestDelegate _next;
    private static ConcurrentDictionary<string, DateTime> _lastSent = new();

    public EmailResendThrottleMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api/auth/resend-verification")
            && context.Request.Method == "POST")
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (_lastSent.TryGetValue(ip, out var lastTime))
            {
                var diff = DateTime.UtcNow - lastTime;
                if (diff < TimeSpan.FromMinutes(5)) 
                {
                    context.Response.StatusCode = 429;
                    await context.Response.WriteAsync("Too many requests. Try again later.");
                    return;
                }
            }
            _lastSent[ip] = DateTime.UtcNow;
        }

        await _next(context);
    }
}
