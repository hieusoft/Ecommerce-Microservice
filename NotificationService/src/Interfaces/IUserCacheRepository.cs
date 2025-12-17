using src.Models;
using System.Threading.Tasks;

namespace src.Interfaces
{
    public interface IUserCacheRepository
    {
      
        Task AddUserAsync(UserCache user);
        Task<UserCache?> GetUserByIdAsync(int userId);

    }
}
