using Application.Interfaces;
using Domain.Entities;
using Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class TokenRepository : ITokenRepository
    {
        private readonly ApplicationDbContext _context;

        public TokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddRefreshTokenAsync(RefreshToken token)
        {
            token.CreatedAt = DateTime.UtcNow;
            await _context.RefreshTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateRefreshTokenAsync(RefreshToken token)
        {
            var oldToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.UserId == token.UserId);


            oldToken.Token = token.Token;
            oldToken.ExpiresAt = token.ExpiresAt;
            oldToken.Revoked = false;

          
            _context.RefreshTokens.Update(oldToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token && !t.Revoked);
        }

        public async Task DeleteRefreshTokenAsync(RefreshToken token)
        {
            token.Revoked = true;
            _context.RefreshTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken> GetRefreshTokenByUserIdAsync(int userId)
        {
            return await _context.RefreshTokens
               .SingleOrDefaultAsync(r => r.UserId == userId);

        }
    }
}

