using Microsoft.AspNetCore.Mvc;
using src.Interfaces;
using src.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace src.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

      
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotificationDto dto)
        {
            var result = await _notificationService.CreateNotificationAsync(dto);
            return Ok(result);
        }

        [HttpGet("{notificationId}")]
        public async Task<IActionResult> GetById(int notificationId)
        {
            var result = await _notificationService.GetByIdAsync(notificationId);
            if (result == null)
            {
                return NotFound(new { message = $"Notification with ID {notificationId} not found." });
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _notificationService.GetAllAsync();
            return Ok(result);
        }
        [HttpPut("{notificationId}")]
        public async Task<IActionResult> Update(int notificationId, [FromBody] NotificationDto dto)
        {
            try
            {
                var updated = await _notificationService.UpdateNotificationAsync(notificationId, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
              
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> Delete(int notificationId)
        {
            await _notificationService.DeleteNotificationAsync(notificationId);
            return NoContent();
        }



        [HttpPost("deliveries")]
        public async Task<IActionResult> CreateDelivery([FromBody] NotificationDeliveryDto dto)
        {
            try
            {
                var result = await _notificationService.CreateNotificationDeliveryAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
               
                return NotFound(new { message = ex.Message });
            }
          
            catch (Exception ex)
            {
               
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }


        [HttpGet("users/{userId}/deliveries")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            var result = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(result);
        }

        [HttpGet("deliveries/{notificationDeliveryId}")]
        public async Task<IActionResult> GetDeliveryById(int notificationDeliveryId)
        {
            var result = await _notificationService.GetUserNotificationByIdAsync(notificationDeliveryId);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}
