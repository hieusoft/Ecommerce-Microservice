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
        public async Task<UserContacts?> GetContactByIdAsync(int contactId)
        {
            return await _context.UserContacts
                .FirstOrDefaultAsync(c => c.ContactId == contactId);
        }
        public async Task<IEnumerable<UserContacts>> GetContactsByUserIdAsync(int userId)
        {
            return await _context.UserContacts
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task AddContactAsync(UserContacts contact)
        {
            await _context.UserContacts.AddAsync(contact);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateContactAsync(UserContacts contact)
        {
            _context.UserContacts.Update(contact);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteContactAsync(UserContacts contact)
        {
            _context.UserContacts.Remove(contact);
            await _context.SaveChangesAsync();
        }
    }
}

