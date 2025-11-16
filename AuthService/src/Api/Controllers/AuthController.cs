using Application.DTOs.Auth;
using Application.UseCases;
using Microsoft.AspNetCore.Mvc;

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
                return Ok(new { message = "User registered successfully" });
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
                var accessToken = await _authUseCases.RefreshTokenAsync(dto);
                return Ok(new { accessToken });
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
                // Always return success to prevent email enumeration
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
                await _authUseCases.ResetPasswordAsync(dto);
                return Ok(new { message = "Password has been reset successfully" });
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

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ForgotPasswordRequestDto dto)
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

