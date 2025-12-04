using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = null!;

        public string Username { get; set; } = null!;

        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public bool EmailVerified { get; set; } = false;
        public int TokenVersion { get; set; } = 1;
        public bool IsBanned { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

      
        

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<RecipientInfo> UserContacts { get; set; } = new List<RecipientInfo>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<EmailVerificationToken> EmailVerificationTokens { get; set; } = new List<EmailVerificationToken>();
        public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    }
}
