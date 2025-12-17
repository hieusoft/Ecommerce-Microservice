using src.Interfaces;
using src.Models;
using src.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace src.Repositories
{
    public class UserCacheRepository : IUserCacheRepository
    {
        private readonly NotificationDbContext _context;

        public UserCacheRepository(NotificationDbContext context)
        {
            _context = context;
        }

        public async Task AddUserAsync(UserCache user)
        {
            _context.UserCache.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task<UserCache?> GetUserByIdAsync(int userId)
        {
            return await _context.UserCache
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }
    }
}
