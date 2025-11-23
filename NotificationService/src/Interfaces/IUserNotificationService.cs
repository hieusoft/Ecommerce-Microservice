using src.Models;

namespace src.Interfaces
{
    public interface IUserNotificationService
    {
        Task<UserNotification> CreateUserNotificationAsync(int userId, int notificationId, int deliveryMethodId);
        Task<List<UserNotification>> GetByUserIdAsync(int userId);
        Task<UserNotification?> GetByIdAsync(int userNotificationId);
        Task MarkAsReadAsync(int userNotificationId);
        Task MarkAllAsReadAsync(int userId);
    }
}
