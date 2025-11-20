using Application.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;

namespace Api.Security
{
    public class JwtTokenValidator
    {
        private readonly IUserRepository _userRepository;

        public JwtTokenValidator(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task ValidateAsync(TokenValidatedContext context)
        {
            try
            {
                var claims = context.Principal;
                var userId = int.Parse(claims.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var tokenVersionInJwt = int.Parse(
                    claims.FindFirst("tokenVersion")?.Value ?? "0"
                );

                var user = await _userRepository.GetByIdAsync(userId);

                if (user == null)
                {
                    context.Fail("User not found");
                    return;
                }

                if (user.TokenVersion != tokenVersionInJwt)
                {
                    context.Fail("Access token invalid due to logout or security update");
                    return;
                }
            }
            catch
            {
                context.Fail("Invalid token");
            }
        }
    }
}
