using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
namespace Application.Interfaces
{
    public interface ITokenRepository
    {
        Task AddRefreshTokenAsync(RefreshToken token);
        Task<RefreshToken> GetRefreshTokenAsync(string token);
        Task DeleteRefreshTokenAsync(RefreshToken token);
    }
}
