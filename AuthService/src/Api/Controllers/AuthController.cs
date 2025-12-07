using Application.DTOs.Auth;
using Application.UseCases;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthUseCases _authUseCases;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AuthUseCases authUseCases, ILogger<AuthController> logger)
        {
            _authUseCases = authUseCases;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            try
            {
                await _authUseCases.RegisterAsync(dto);
                return Ok(new { message = "Please verify your email!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            try
            {
                var (accessToken, refreshToken) = await _authUseCases.LoginAsync(dto);
                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });
                return Ok(new
                {
                    accessToken,
                    refreshToken
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                var (newAccessToken, newRefreshToken) = await _authUseCases.RefreshTokenAsync(dto);
                Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });
                return Ok(new
                {
                    newAccessToken,
                    newRefreshToken
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return Unauthorized(new { message = ex.Message });
            }
        }




        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            try
            {
                await _authUseCases.ForgotPasswordAsync(dto);
                
                return Ok(new { message = "If the email exists, a password reset link has been sent." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot password request");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            try
            {
                var (accessToken, refreshToken) = await _authUseCases.ResetPasswordAsync(dto);
                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });
                return Ok(new
                {
                    message = "Password has been reset successfully",
                    accessToken,
                    refreshToken
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                var dto = new VerifyEmailRequestDto { Token = token };
                await _authUseCases.VerifyEmailAsync(dto);
                return Ok(new { message = "Email verified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email"); 
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
          
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "Invalid token" });

            if (!int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "Invalid token" });

            try
            {
       
               await _authUseCases.ChangePasswordAsync(dto, userId);

               

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationRequestDto dto)
        {
            try
            {
                await _authUseCases.ResendVerificationEmailAsync(dto);
                return Ok(new { message = "Verification email has been sent" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending verification email");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

