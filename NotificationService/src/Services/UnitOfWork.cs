using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using src.Data;
using src.Interfaces;
using src.Repositories;
using System;
using System.Threading.Tasks;

namespace src.Services
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly NotificationDbContext _context;

        public UnitOfWork(NotificationDbContext context)
        {
            _context = context;
            Notifications = new NotificationRepository(_context);
            NotificationDelivery = new NotificationDeliveryRepository(_context);
        }

        public INotificationRepository Notifications { get; private set; }
        public INotificationDeliveryRepository NotificationDelivery { get; private set; }


        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
