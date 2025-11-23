using src.Models;

namespace src.Interfaces
{
    public interface IUserNotificationRepository
    {
        Task<UserNotification> AddAsync(UserNotification userNotification);
        Task<UserNotification?> GetByIdAsync(int userNotificationId);
        Task<List<UserNotification>> GetByUserIdAsync(int userId);
        Task UpdateAsync(UserNotification userNotification);
    }
}
