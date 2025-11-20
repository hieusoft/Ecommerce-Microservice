using Application.Interfaces;
using Domain.Entities;
using Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // Add this at the top

namespace Infrastructure.Repositories
{
    public class EmailVerificationTokenRepository : IEmailVerificationTokenRepository

    {
        private readonly ApplicationDbContext _context;

        public EmailVerificationTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token)
        {
            return await _context.EmailVerificationTokens
                .FirstOrDefaultAsync(t=>t.Token == token);
        }


        public async Task AddEmailVerificationTokenAsync(EmailVerificationToken token)
        {
            token.CreatedAt = DateTime.UtcNow;
            token.UpdatedAt = DateTime.UtcNow;
            _context.EmailVerificationTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmailVerificationTokenAsync(EmailVerificationToken token)
        {
            token.Verified = true;
            token.UpdatedAt = DateTime.UtcNow;
            _context.EmailVerificationTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public async Task<EmailVerificationToken> GetEmailVerificationTokensByUserIdAsync(int userId)
        {
            return await _context.EmailVerificationTokens
             .FirstOrDefaultAsync(r => r.UserId == userId);
        }
    }
}

