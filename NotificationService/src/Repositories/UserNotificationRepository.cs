using src.Data;
using src.Interfaces;
using src.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace src.Repositories
{
    public class UserNotificationRepository : IUserNotificationRepository
    {
        private readonly NotificationDbContext _context;

        public UserNotificationRepository(NotificationDbContext context)
        {
            _context = context;
        }

       
        public async Task<UserNotification> AddAsync(UserNotification userNotification)
        {
            _context.UserNotifications.Add(userNotification);
            await _context.SaveChangesAsync();
            return userNotification;
        }


        public async Task<UserNotification?> GetByIdAsync(int userNotificationId)
        {
            return await _context.UserNotifications
                .Include(un => un.Notification) 
                .FirstOrDefaultAsync(un => un.UserNotificationId == userNotificationId);
        }

       
        public async Task<List<UserNotification>> GetByUserIdAsync(int userId)
        {
            return await _context.UserNotifications
                .Where(un => un.UserId == userId)
                .Include(un => un.Notification)
                .OrderByDescending(un => un.SentAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(UserNotification userNotification)
        {
            _context.UserNotifications.Update(userNotification);
            await _context.SaveChangesAsync();
        }
    }
}
