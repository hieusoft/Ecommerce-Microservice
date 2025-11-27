using src.Models;

namespace src.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> AddAsync(Notification notification);
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<List<Notification>> GetAllAsync();
        Task DeleteAsync(int notificationId);
        Task<Notification> UpdateAsync(Notification notification);
    }
}
