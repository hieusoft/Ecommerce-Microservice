using src.Interfaces;
using src.Models;
using src.Data;
using System.Threading.Tasks;

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
    }
}
