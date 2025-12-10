using Application.DTOs.User;
using Application.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpGet("profile")]
      
        public async Task<IActionResult> GetProfile()
        {
            try
            {

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(new { message = "Invalid token" });

                var userId = int.Parse(userIdClaim.Value);
             

                

                
                var userProfile = await _userUseCases.GetUserByIdAsync(userId);

                return Ok(new
                {
                    userProfile.UserId,
                    userProfile.FullName,
                    userProfile.UserName,
                    userProfile.Email,
                    userProfile.Roles,
                    userProfile.EmailVerified
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user profile");
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserQueryModelDto query)
        {
            try
            {
                var users = await _userUseCases.GetAllUsersAsync(query);
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

        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
        [HttpPost("remove-role")]
        public async Task<IActionResult> RemoveRole([FromBody] RemoveRoleRequestDto dto)
        {
            try
            {
                await _userUseCases.RemoveRoleAsync(dto);
                return Ok(new { message = "Role removed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("ban-user")]
        public async Task<IActionResult> BanUser([FromBody] BanUserRequestDto dto)
        {
            try
            {
                await _userUseCases.BanUserAsync(dto.EmailOrUsername);
                return Ok(new { message = "User has been banned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning user");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("unban-user")]
        public async Task<IActionResult> UnbanUser([FromBody] BanUserRequestDto dto)
        {
            try
            {
                await _userUseCases.UnbanUserAsync(dto.EmailOrUsername);
                return Ok(new { message = "User has been unbanned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning user");
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("{userId}/recipients")]
        public async Task<IActionResult> GetRecipientsByUser(int userId)
        {
            try
            {
                var recipients = await _userUseCases.GetRecipientsByUserIdAsync(userId);
                return Ok(recipients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipients");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("recipients/{recipientId}")]
        public async Task<IActionResult> GetRecipientById(int recipientId)
        {
            try
            {
                var recipient = await _userUseCases.GetRecipientById(recipientId);
                if (recipient == null)
                    return NotFound(new { message = "Recipient not found" });
                return Ok(recipient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipient");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("recipients")]
        public async Task<IActionResult> AddRecipient([FromBody] RecipientRequestDto dto)
        {
            try
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(new { message = "Invalid token" });

                var userId = int.Parse(userIdClaim.Value);

                await _userUseCases.AddRecipientAsync(dto,userId);
                return Ok(new { message = "Recipient added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding recipient");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("recipients")]
        public async Task<IActionResult> UpdateRecipient([FromBody] UpdateRecipientInfoRequestDto dto)
        {
            try
            {
                await _userUseCases.UpdateRecipientAsync(dto);
                return Ok(new { message = "Recipient updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recipient");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Xóa ng??i nh?n
        [HttpDelete("recipients/{recipientId}")]
        public async Task<IActionResult> DeleteRecipient(int recipientId)
        {
            try
            {
                await _userUseCases.DeleteRecipientAsync(recipientId);
                return Ok(new { message = "Recipient deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recipient");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
