using src.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace src.Services
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration)
        {
            var apiKey = configuration["Brevo:ApiKey"]
                ?? throw new InvalidOperationException("Brevo API Key is missing");
            _fromEmail = configuration["Brevo:FromEmail"] ?? "noreply@example.com";
            _fromName = configuration["Brevo:FromName"] ?? "Notification Service";

            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri(configuration["Brevo:BaseUrl"] ?? "https://api.brevo.com/v3/");
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            Console.WriteLine($"[Fake Email] To: {to}, Subject: {subject}");

            //var payload = new
            //{
            //    sender = new { name = _fromName, email = _fromEmail },
            //    to = new[] { new { email = to } },
            //    subject = subject,
            //    htmlContent = body
            //};

            //var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            //var response = await _httpClient.PostAsync("https://api.brevo.com/v3/smtp/email", content);
            //response.EnsureSuccessStatusCode(); 
        }
    }
}
