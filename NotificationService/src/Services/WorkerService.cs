using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using src.DTOs;
using src.Interfaces;
using src.Models;
using System.Text.Json;

namespace src.Services
{
    public class WorkerService : IWorkerService

    {
        private readonly IEmailService _emailService;

        private  readonly INotificationService _notificationService;
        private readonly ITemplateService _templateService;

        public WorkerService(INotificationService notificationService, IEmailService emailService,ITemplateService templateService)
        {
            _notificationService = notificationService;
            _emailService = emailService;
            _templateService = templateService;
        }
        public async Task HandleQueueMessageAsync(string queue, QueueMessageDto dto)
        {
            string title = "";
            string content = "";
            Console.WriteLine(dto.UserId);
            switch (queue)

            {
                case "email.verification_requested_q":
                    title = "Xác thực email";
                    content = $"Xin chào {dto.UserName}, vui lòng xác thực email: {dto.Token}";
                    break;

                case "password.reset_requested_q":
                    title = "Reset mật khẩu";
                    content = $"Xin chào {dto.UserName}, reset token: {dto.Token}";
                    break;

                case "notification.user_registered_q":
                    title = "Chào mừng người dùng mới";
                    content = $"Xin chào {dto.UserName}, cảm ơn bạn đã đăng ký!";
                    break;

               
                case "push.new_message_q":
                    //title = dto.Metadata?["Title"]?.ToString() ?? "Thông báo mới";
                    //content = dto.Metadata?["Content"]?.ToString() ?? "";
                    break;
                case "notification.email_q":
                    {
                        title = dto.Title ?? "Thông báo";

                        string metadataJson = JsonConvert.SerializeObject(dto);
                        var deliveryDto = new NotificationDeliveryDto
                        {
                            NotificationId = dto.NotificationId ?? 0,
                            UserId = dto.UserId ?? 0,
                            DeliveryMethod = "email",
                            Status = 0,
                            Metadata = metadataJson
                        };

                        await _notificationService.CreateNotificationDeliveryAsync(deliveryDto);

                        var body = await _templateService.RenderAsync("email_promotion.cshtml", dto);
                        await _emailService.SendEmailAsync(dto.Email ?? "", title, body);

                        break;
                    }

                default:
                    title = "Thông báo";
                    content = $"Xin chào {dto.UserName}, bạn nhận được thông báo từ queue {queue}";
                    break;
            }

           
        }
    }
}
