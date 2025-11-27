using src.Data;
using src.Interfaces;
using src.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace src.Repositories
{
    public class NotificationDeliveryRepository : INotificationDeliveryRepository
    {
        private readonly NotificationDbContext _context;

        public NotificationDeliveryRepository(NotificationDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationDelivery> AddAsync(NotificationDelivery userNotification)
        {
            _context.NotificationDelivery.Add(userNotification);
            return userNotification; 
        }

        public async Task<NotificationDelivery?> GetByIdAsync(int userNotificationId)
        {
            return await _context.NotificationDelivery
                .Include(un => un.Notification)
                .FirstOrDefaultAsync(un => un.NotificationDeliveryId == userNotificationId);
        }

        public async Task<List<NotificationDelivery>> GetByUserIdAsync(int userId)
        {
            return await _context.NotificationDelivery
                .Where(un => un.UserId == userId)
                .Include(un => un.Notification)
                .OrderByDescending(un => un.CreatedAt)
                .ToListAsync();
        }

        public async Task<DeliveryMethod?> GetDeliveryMethodByNameAsync(string name)
        {
            return await _context.DeliveryMethods
                .FirstOrDefaultAsync(dm => dm.Name == name);
        }

        public async Task UpdateAsync(NotificationDelivery userNotification)
        {
            _context.NotificationDelivery.Update(userNotification);
            
        }
    }
}
