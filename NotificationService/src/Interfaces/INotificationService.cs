using src.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace src.Interfaces
{
    public interface INotificationService
    {
     
        Task<NotificationDto> CreateNotificationAsync(NotificationDto dto);

        Task<int> AddNotificationAsync(NotificationDto dto);
        Task<NotificationDto?> GetByIdAsync(int notificationId);

       
        Task<List<NotificationDto>> GetAllAsync();

        Task<NotificationDto> UpdateNotificationAsync(int motificationId, NotificationDto dto);
        Task DeleteNotificationAsync(int notificationId);

     
        Task<NotificationDeliveryDto> CreateNotificationDeliveryAsync(NotificationDeliveryDto dto);

        Task<List<NotificationDeliveryDto>> GetUserNotificationsAsync(int userId);

      
        Task<NotificationDeliveryDto?> GetUserNotificationByIdAsync(int notificationDeliveryId);

       
      
    }
}
