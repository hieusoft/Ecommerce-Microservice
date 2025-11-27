using Microsoft.EntityFrameworkCore;
using src.DTOs;
using src.Interfaces;
using src.Models;
using System.Text.Json;

namespace src.Services
{
    public class WorkerService : IWorkerService

    {
        private readonly IEmailService _emailService;

        public  readonly INotificationService _notificationService;


        public WorkerService(INotificationService notificationService, IEmailService emailService)
        {
            _notificationService = notificationService;
            _emailService = emailService;
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
                    title = dto.Metadata?["Title"]?.ToString() ?? "Thông báo mới";
                    content = dto.Metadata?["Content"]?.ToString() ?? "";
                    break;

                default:
                    title = "Thông báo";
                    content = $"Xin chào {dto.UserName}, bạn nhận được thông báo từ queue {queue}";
                    break;
            }

            //var notification = await _notificationService.CreateNotificationAsync(title, content);

       
            //if (!string.IsNullOrEmpty(dto.Email))
            //{
            //    //bool sent = await _emailService.SendEmailAsync(dto.Email, title, content);

              
            //    //var emailDelivery = await _notificationService.DeliveryMethods
            //    //    .FirstOrDefaultAsync(dm => dm.Name == "Email");

            //    //if (emailDelivery != null)
            //    //{
            //    //    var userNotification = new UserNotification
            //    //    {
            //    //        UserId = dto.UserId ?? 0,
            //    //        NotificationId = notification.NotificationId,
            //    //        DeliveryMethodId = emailDelivery.DeliveryMethodId,
            //    //        Status = 0,
            //    //        SentAt = DateTime.UtcNow,
            //    //        Metadata = JsonSerializer.Serialize(new { Queue = queue, SentSuccess = sent })
            //    //    };

            //    //    _dbContext.UserNotifications.Add(userNotification);
            //    //    await _dbContext.SaveChangesAsync();
            //    //}
            //}
        }
    }
}
