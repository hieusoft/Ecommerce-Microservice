using src.Data;
using src.Interfaces;
using src.Repositories;

namespace src.Services
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly NotificationDbContext _context;

        public UnitOfWork(NotificationDbContext context)
        {
            _context = context;
            Notifications = new NotificationRepository(_context);
            UserNotifications = new UserNotificationRepository(_context);
        }

        public INotificationRepository Notifications { get; private set; }
        public IUserNotificationRepository UserNotifications { get; private set; }

        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
