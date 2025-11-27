using Microsoft.EntityFrameworkCore.Storage;
using System.Threading.Tasks;

namespace src.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        INotificationRepository Notifications { get; }
        INotificationDeliveryRepository NotificationDelivery { get; }
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<int> CommitAsync();
    }
}
