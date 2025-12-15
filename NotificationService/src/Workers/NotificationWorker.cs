using Microsoft.Extensions.Hosting;
using System.Text.Json;
using src.DTOs;
using src.Interfaces;

namespace src.Workers;

public class NotificationWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationWorker> _logger;

    private readonly string[] _queues =
    {
        "email.verification_requested_q",
        "email.verified_q",
        "notification.user_registered_q",
        "notification.user_banned_q",
        "notification.user_unbanned_q",
        "notification.email_q",
        "order.cancelled_q",
        "order.paid_q",
        "order.delivery_q",
        "password.reset_requested_q",
        "password.reset_completed_q"
    };

    public NotificationWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var rabbitMqService = scope.ServiceProvider.GetRequiredService<IRabbitMqService>();

        foreach (var queue in _queues)
        {
            rabbitMqService.Subscribe(queue, async (message, _) =>
            {
                using var messageScope = _scopeFactory.CreateScope();
                var workerService =
                    messageScope.ServiceProvider.GetRequiredService<IWorkerService>();

                try
                {
                    var dto = JsonSerializer.Deserialize<QueueMessageDto>(message);
                    if (dto == null) return;

                    await workerService.HandleQueueMessageAsync(queue, dto);

                    _logger.LogInformation(
                        "Đã xử lý message từ queue {Queue}", queue);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Xử lý message từ queue {Queue} thất bại", queue);
                }
            });
        }

        _logger.LogInformation("NotificationWorker đang lắng nghe các queue...");

        return Task.CompletedTask; 
    }
}
