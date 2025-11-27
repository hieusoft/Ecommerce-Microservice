using src.Models;

namespace src.Interfaces
{
    public interface INotificationDeliveryRepository
    {
        Task<NotificationDelivery> AddAsync(NotificationDelivery userNotification);
        Task<NotificationDelivery?> GetByIdAsync(int userNotificationId);
        Task<List<NotificationDelivery>> GetByUserIdAsync(int userId);
        Task UpdateAsync(NotificationDelivery userNotification);
        Task<DeliveryMethod?> GetDeliveryMethodByNameAsync(string name);

    }
}
