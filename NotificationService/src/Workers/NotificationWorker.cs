using src.DTOs;
using src.Interfaces;
using System.Text.Json;

namespace src.Workers
{
    public class NotificationWorker
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationWorker> _logger;

        public NotificationWorker(IServiceScopeFactory scopeFactory, ILogger<NotificationWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public void Start()
        {
            using var scope = _scopeFactory.CreateScope();

            var rabbitMqService = scope.ServiceProvider.GetRequiredService<IRabbitMqService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Subscribe queue email_service_queue
            rabbitMqService.Subscribe("email_service_queue", async (message, routingKey) =>
            {
                var dto = JsonSerializer.Deserialize<SendVerifyEmailDto>(message);
                if (dto == null) return;

                switch (routingKey)
                {
                    case "email.verification_requested":
                        await emailService.SendEmailAsync(dto.Email, "Xác thực email",
                            $"Xin chào {dto.UserName}, vui lòng xác thực email: {dto.Token}");
                        break;

                    case "password.reset_requested":
                        await emailService.SendEmailAsync(dto.Email, "Reset mật khẩu",
                            $"Xin chào {dto.UserName}, reset token: {dto.Token}");
                        break;
                }

                _logger.LogInformation($"Email đã gửi tới {dto.Email} từ queue email_service_queue (routingKey={routingKey})");
            });

          
            rabbitMqService.Subscribe("notification_service_queue", async (message, routingKey) =>
            {
                var dto = JsonSerializer.Deserialize<SendVerifyEmailDto>(message);
                if (dto == null) return;

                switch (routingKey)
                {
                    case "user.registered":
                        await emailService.SendEmailAsync(dto.Email, "Chào mừng người dùng mới",
                            $"Xin chào {dto.UserName}, cảm ơn bạn đã đăng ký!");
                        break;

                    case "user.banned":
                        await emailService.SendEmailAsync(dto.Email, "Tài khoản bị khóa",
                            $"Xin chào {dto.UserName}, tài khoản của bạn đã bị khóa!");
                        break;

                    case "user.unbanned":
                        await emailService.SendEmailAsync(dto.Email, "Tài khoản được mở lại",
                            $"Xin chào {dto.UserName}, tài khoản của bạn đã được mở lại!");
                        break;
                }

                _logger.LogInformation($"Email đã gửi tới {dto.Email} từ queue notification_service_queue (routingKey={routingKey})");
            });

            Console.WriteLine("NotificationWorker đang lắng nghe các queue...");
        }
    }
}
