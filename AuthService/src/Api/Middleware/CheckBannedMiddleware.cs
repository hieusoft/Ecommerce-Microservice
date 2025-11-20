using Application.Interfaces;
using System.Security.Claims;

namespace Api.Middleware
{
    public class CheckBannedMiddleware
    {
        private readonly RequestDelegate _next;

        public CheckBannedMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
        {
         
            if (context.User.Identity != null && context.User.Identity.IsAuthenticated)
            {
  
                var userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    var user = await userRepository.GetByIdAsync(userId);
                    if (user != null && user.IsBanned)
                    {
                       
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new
                        {
                            message = "Your account has been banned."
                        });
                        return;
                    }
                }
            }

         
            await _next(context);
        }
    }
}
