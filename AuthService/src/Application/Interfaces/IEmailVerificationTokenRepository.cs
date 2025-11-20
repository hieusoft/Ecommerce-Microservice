using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IEmailVerificationTokenRepository
    {
        Task<EmailVerificationToken?> GetEmailVerificationTokenAsync(string token);
        Task AddEmailVerificationTokenAsync(EmailVerificationToken token);
        Task UpdateEmailVerificationTokenAsync(EmailVerificationToken token);

        Task<EmailVerificationToken>GetEmailVerificationTokensByUserIdAsync(int userId);
    }
}
