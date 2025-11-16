using Application.DTOs.User;
using Application.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserUseCases _userUseCases;
        private readonly ILogger<UserController> _logger;

        public UserController(UserUseCases userUseCases, ILogger<UserController> logger)
        {
            _userUseCases = userUseCases;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userUseCases.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _userUseCases.GetUserByIdAsync(id);
                if (user.UserId == 0)
                    return NotFound(new { message = "User not found" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by id");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequestDto dto)
        {
            try
            {
                await _userUseCases.UpdateUserAsync(dto);
                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequestDto dto)
        {
            try
            {
                await _userUseCases.DeleteUserAsync(dto);
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequestDto dto)
        {
            try
            {
                await _userUseCases.AssignRoleAsync(dto);
                return Ok(new { message = "Role assigned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

