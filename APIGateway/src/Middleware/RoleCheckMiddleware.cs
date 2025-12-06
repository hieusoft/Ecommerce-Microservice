using System.Security.Claims;

namespace src.Middleware
{
    public class RoleCheckMiddleware
    {
        private readonly RequestDelegate _next;
        public RoleCheckMiddleware(RequestDelegate next) => _next = next;

        public async Task Invoke(HttpContext context)
        {
          
            var path = context.Request.Path.Value;
            var method = context.Request.Method;

            if (path.StartsWith("/admin") &&
                (method == "POST" || method == "PUT" || method == "DELETE"))
            {
                if (!context.User.Identity.IsAuthenticated)
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    await context.Response.WriteAsync("Unauthorized");
                    return;
                }

                var roles = context.User.Claims
                    .Where(c => c.Type == ClaimTypes.Role)
                    .Select(c => c.Value);

                // Kiểm tra role, ví dụ chỉ Admin
                if (!roles.Contains("Admin"))
                {
                    context.Response.StatusCode = 403; // Forbidden
                    await context.Response.WriteAsync("Forbidden");
                    return;
                }
            }

            await _next(context);
        }
    }

}
