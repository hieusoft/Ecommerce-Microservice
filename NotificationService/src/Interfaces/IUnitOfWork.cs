using System.Threading.Tasks;

namespace src.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        INotificationRepository Notifications { get; }
        IUserNotificationRepository UserNotifications { get; }
        Task<int> CommitAsync();
    }
}
