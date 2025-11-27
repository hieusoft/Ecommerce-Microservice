using src.DTOs;
using src.Interfaces;
using System.Text.Json;

namespace src.Workers
{
    public class NotificationWorker
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationWorker> _logger;
        private readonly IWorkerService _workerService;
      
        private readonly string[] _queues = new[]
        {
            "email.verification_requested_q",
            "email.verified_q",
            "password.reset_requested_q",
            "password.reset_completed_q",
            "notification.user_registered_q",
            "notification.user_banned_q",
            "notification.user_unbanned_q",
            "notification.email_q"
            
        };

        public NotificationWorker(IServiceScopeFactory scopeFactory, ILogger<NotificationWorker> logger,IWorkerService workerService)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _workerService = workerService;
        }

        public void Start()
        {
            using var scope = _scopeFactory.CreateScope();
            var rabbitMqService = scope.ServiceProvider.GetRequiredService<IRabbitMqService>();

            // Khởi tạo tất cả subscription song song
            var tasks = _queues.Select(queue => Task.Run(() =>
            {
                rabbitMqService.Subscribe(queue, async (message, _) =>
                {
                    try
                    {
                        var dto = JsonSerializer.Deserialize<QueueMessageDto>(message);
                        if (dto == null) return;

                        await _workerService.HandleQueueMessageAsync(queue, dto);

                        _logger.LogInformation($"Message từ queue {queue} đã xử lý thành công.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Xử lý message từ queue {queue} thất bại.");
                    }
                });
            })).ToArray();

            Task.WaitAll(tasks); // Chờ tất cả subscription được đăng ký
            Console.WriteLine("NotificationWorker đang lắng nghe các queue...");
        }

       
    }
}
