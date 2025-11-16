namespace Application.Interfaces
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string userName, string verificationToken);
        Task SendPasswordResetEmailAsync(string email, string userName, string resetToken);
    }
}
