using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token);
        Task AddPasswordResetTokenAsync(PasswordResetToken token);
        Task UpdatePasswordResetTokenAsync(PasswordResetToken token);



        Task<IEnumerable<PasswordResetToken>> GetPasswordResetTokensByUserIdAsync(int userId);
    }
}
