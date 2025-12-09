using Application.Interfaces;
using Domain.Entities;
using Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public IQueryable<User> Query()
        {
            return _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByEmailOrUsernameAsync(string input)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Username == input || u.Email == input);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            try
            {
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
            
                Console.WriteLine("DbUpdateException: " + dbEx.Message);
                if (dbEx.InnerException != null)
                    Console.WriteLine("InnerException: " + dbEx.InnerException.Message);

                throw; 
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("InnerException: " + ex.InnerException.Message);
                throw;
            }
        }


        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<RecipientInfo?> GetRecipientByIdAsync(int recipientId)
        {
            return await _context.RecipientInfo
               .FirstOrDefaultAsync(r => r.RecipientId == recipientId);
        }

        public async Task<IEnumerable<RecipientInfo>> GetRecipientsByUserIdAsync(int userId)
        {
            return await _context.RecipientInfo
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async  Task AddRecipientAsync(RecipientInfo recipientInfo)
        {
            await _context.RecipientInfo.AddAsync(recipientInfo);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRecipientAsync(RecipientInfo recipientInfo)
        {
            _context.RecipientInfo.Update(recipientInfo);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRecipientAsync(RecipientInfo RecipientInfo)
        {
            _context.RecipientInfo.Remove(RecipientInfo);
            await _context.SaveChangesAsync();
        }
    }
}

