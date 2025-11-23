using src.Models;

namespace src.Interfaces
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(string title, string content, int? createdBy = null);
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<List<Notification>> GetAllAsync();
        Task DeleteNotificationAsync(int notificationId);
    }
}
