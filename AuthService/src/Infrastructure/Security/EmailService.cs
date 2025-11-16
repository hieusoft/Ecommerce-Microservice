using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Security
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _baseUrl;

        public EmailService(IConfiguration configuration)
        {
            _apiKey = configuration["Brevo:ApiKey"] ?? throw new InvalidOperationException("Brevo API Key is missing");
            _fromEmail = configuration["Brevo:FromEmail"] ?? "noreply@example.com";
            _fromName = configuration["Brevo:FromName"] ?? "Auth Service";
            _baseUrl = configuration["Brevo:BaseUrl"] ?? "http://localhost:5000";

            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task SendVerificationEmailAsync(string email, string userName, string verificationToken)
        {
            var verificationLink = $"{_baseUrl}/api/auth/verify-email?token={verificationToken}";

            var payload = new
            {
                sender = new { email = _fromEmail, name = _fromName },
                to = new[] { new { email = email, name = userName } },
                subject = "Verify Your Email Address",
                htmlContent = $@"
                    <html>
                        <body>
                            <h2>Hello {userName},</h2>
                            <p>Please verify your email: <a href='{verificationLink}'>Verify Email</a></p>
                        </body>
                    </html>"
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.brevo.com/v3/smtp/email", content);
            response.EnsureSuccessStatusCode();
        }

        public async Task SendPasswordResetEmailAsync(string email, string userName, string resetToken)
        {
            var resetLink = $"{_baseUrl}/reset-password?token={resetToken}";

            var payload = new
            {
                sender = new { email = _fromEmail, name = _fromName },
                to = new[] { new { email = email, name = userName } },
                subject = "Reset Your Password",
                htmlContent = $@"
                    <html>
                        <body>
                            <h2>Hello {userName},</h2>
                            <p>Click to reset password: <a href='{resetLink}'>Reset Password</a></p>
                        </body>
                    </html>"
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.brevo.com/v3/smtp/email", content);
            response.EnsureSuccessStatusCode();
        }
    }
}
