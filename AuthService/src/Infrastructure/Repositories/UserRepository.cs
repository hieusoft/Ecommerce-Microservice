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

        //public async Task<User?> GetByVerificationTokenAsync(string token)
        //{
        //    return await _context.Users
        //        .Include(u => u.UserRoles)
        //            .ThenInclude(ur => ur.Role)
        //        .FirstOrDefaultAsync(u => u.VerificationToken == token);
        //}

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
                // Thông tin chi tiết về lỗi SQL
                Console.WriteLine("DbUpdateException: " + dbEx.Message);
                if (dbEx.InnerException != null)
                    Console.WriteLine("InnerException: " + dbEx.InnerException.Message);

                throw; // Optional: ném lại để tầng trên xử lý
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

        public async Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token)
        {

            return await _context.EmailVerificationTokens
                
                .FirstOrDefaultAsync(t=> t.Token == token);
        }


        public async Task AddEmailVerificationTokenAsync(EmailVerificationToken token)
        {
            token.CreatedAt = DateTime.UtcNow;
            _context.EmailVerificationTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        public Task UpdateEmailVerificationTokenAsync(EmailVerificationToken token)
        {
            throw new NotImplementedException();
        }

        public Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token)
        {
            throw new NotImplementedException();
        }

        public Task AddPasswordResetTokenAsync(PasswordResetToken token)
        {
            throw new NotImplementedException();
        }

        public Task UpdatePasswordResetTokenAsync(PasswordResetToken token)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<EmailVerificationToken>> GetEmailVerificationTokensByUserIdAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PasswordResetToken>> GetPasswordResetTokensByUserIdAsync(int userId)
        {
            throw new NotImplementedException();
        }
    }
}

