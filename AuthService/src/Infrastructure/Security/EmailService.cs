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

            // Add default headers
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Add("api-key", _apiKey);
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
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f2f5f8;
                        margin: 0;
                        padding: 0;
                    }}
                    .wrapper {{
                        width: 100%;
                        padding: 20px 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        background: linear-gradient(90deg, #6a11cb, #2575fc);
                        color: #ffffff;
                        padding: 30px 20px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                    }}
                    .content {{
                        padding: 30px 20px;
                        color: #555555;
                        font-size: 16px;
                        line-height: 1.6;
                    }}
                    .content h2 {{
                        color: #333333;
                    }}
                    .button {{
                        display: inline-block;
                        margin: 20px 0;
                        padding: 15px 30px;
                        font-size: 16px;
                        color: #ffffff;
                        background: linear-gradient(90deg, #6a11cb, #2575fc);
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    }}
                    .footer {{
                        text-align: center;
                        font-size: 12px;
                        color: #999999;
                        padding: 20px;
                    }}
                    @media screen and (max-width: 600px) {{
                        .container {{ width: 90%; }}
                        .header h1 {{ font-size: 24px; }}
                        .content h2 {{ font-size: 20px; }}
                    }}
                </style>
            </head>
            <body>
                <div class='wrapper'>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to Our Service!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {userName},</h2>
                            <p>Thank you for signing up! To complete your registration, please verify your email by clicking the button below:</p>
                            <a href='{verificationLink}' class='button'>Verify Email</a>
                            <p>If you did not create this account, you can safely ignore this email.</p>
                        </div>
                        <div class='footer'>
                            &copy; {DateTime.Now.Year} Auth Service. All rights reserved.
                        </div>
                    </div>
                </div>
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
