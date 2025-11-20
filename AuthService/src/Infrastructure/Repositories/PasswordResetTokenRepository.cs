using Application.Interfaces;
using Domain.Entities;
using Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly ApplicationDbContext _context;
        public PasswordResetTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token)
        {
            return await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token);
        }
        public async Task AddPasswordResetTokenAsync(PasswordResetToken token)
        {
            if (token == null)
                throw new ArgumentNullException(nameof(token));
            token.CreatedAt = DateTime.UtcNow;
            token.UpdatedAt = DateTime.UtcNow;

            await _context.PasswordResetTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePasswordResetTokenAsync(PasswordResetToken token)
        {
            token.UpdatedAt = DateTime.UtcNow;
            _context.PasswordResetTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public Task<IEnumerable<PasswordResetToken>> GetPasswordResetTokensByUserIdAsync(int userId)
        {
            throw new NotImplementedException();
        }
    }
}
