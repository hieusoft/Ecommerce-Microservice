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
                await _userUseCases.BanUserAsync(dto.UserId);
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
                await _userUseCases.UnbanUserAsync(dto.UserId);
                return Ok(new { message = "User has been unbanned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning user");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{userId}/contacts")]
        public async Task<IActionResult> GetContactsByUser(int userId)
        {
            
            try
            {
                var contacts = await _userUseCases.GetContactsByUserIdAsync(userId);
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contacts");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("contacts/{contactId}")]
        public async Task<IActionResult> GetContactById(int contactId)
        {
            try
            {
                var contact = await _userUseCases.GetContactByIdAsync(contactId);
                if (contact == null)
                    return NotFound(new { message = "Contact not found" });
                return Ok(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contact");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("contacts")]
        public async Task<IActionResult> AddContact([FromBody] AddUserContactRequestDto dto)
        {
            try
            {
                await _userUseCases.AddContactAsync(dto);
                return Ok(new { message = "Contact added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding contact");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("contacts")]
        public async Task<IActionResult> UpdateContact([FromBody] UpdateUserContactRequestDto dto)
        {
            try
            {
                await _userUseCases.UpdateContactAsync(dto);
                return Ok(new { message = "Contact updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contact");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("contacts/{contactId}")]
        public async Task<IActionResult> DeleteContact(int contactId)
        {
            try
            {
                await _userUseCases.DeleteContactAsync(contactId);
                return Ok(new { message = "Contact deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contact");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
