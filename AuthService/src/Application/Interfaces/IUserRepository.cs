using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IUserRepository
    {
     
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

       
        Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token);
        Task AddEmailVerificationTokenAsync(EmailVerificationToken token);
        Task UpdateEmailVerificationTokenAsync(EmailVerificationToken token);

    
        Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token);
        Task AddPasswordResetTokenAsync(PasswordResetToken token);
        Task UpdatePasswordResetTokenAsync(PasswordResetToken token);

      
        Task<IEnumerable<EmailVerificationToken>> GetEmailVerificationTokensByUserIdAsync(int userId);
        Task<IEnumerable<PasswordResetToken>> GetPasswordResetTokensByUserIdAsync(int userId);
    }
}
