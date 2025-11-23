using src.Interfaces;
using src.Models;

namespace src.Services
{
    public class UserNotificationService : IUserNotificationService
    {
        public Task<UserNotification> CreateUserNotificationAsync(int userId, int notificationId, int deliveryMethodId)
        {
            throw new NotImplementedException();
        }

        public Task<UserNotification?> GetByIdAsync(int userNotificationId)
        {
            throw new NotImplementedException();
        }

        public Task<List<UserNotification>> GetByUserIdAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task MarkAllAsReadAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task MarkAsReadAsync(int userNotificationId)
        {
            throw new NotImplementedException();
        }
    }
}
