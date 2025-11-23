using src.Interfaces;
using src.Models;

namespace src.Services

{
    public class NotificationService : INotificationService
    {
        public Task<Notification> CreateNotificationAsync(string title, string content, int? createdBy = null)
        {
            throw new NotImplementedException();
        }

        public Task DeleteNotificationAsync(int notificationId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Notification>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Notification?> GetByIdAsync(int notificationId)
        {
            throw new NotImplementedException();
        }
    }
}
