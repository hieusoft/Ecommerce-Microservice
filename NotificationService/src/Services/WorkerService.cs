using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
        private readonly string _domain;
        private readonly string _client;
        private readonly IUserCacheRepository _userCacheRepository;
        public WorkerService(IConfiguration configuration,INotificationService notificationService, IEmailService emailService,ITemplateService templateService,IUserCacheRepository userCacheRepository)
        {
            _domain= configuration["Brevo:BaseUrl"] ?? "Notification Service";
            _client = configuration["Brevo:ClientUrl"];
            _notificationService = notificationService;
            _emailService = emailService;
            _templateService = templateService;
            _userCacheRepository = userCacheRepository;
        }
        public async Task HandleQueueMessageAsync(string queue, QueueMessageDto dto)
        {
            switch (queue)
            {

                case "email.verification_requested_q":
                    {
                        var verifyUrl = $"{_domain}/auth/verify-email?token={Uri.EscapeDataString(dto.Token)}";

                        dto.Token = verifyUrl;

                        string title = dto.Title ?? "Verify Email";

                        await SaveNotificationAsync(
                            title,
                            dto.Content ?? "",
                            dto.UserId,
                            dto
                        );

                        Console.WriteLine("Verify URL: " + verifyUrl);

                        await SendEmailFromTemplate(
                            dto.Email!,
                            title,
                            "email_verify_email.cshtml",
                            dto
                        );

                        break;
                    }


                case "email.verified_q":
                    {
                        dto.Token = $"{_client}/login";
                        string title = dto.Title ?? "Email Verified Successfully";
                        var user = new UserCache {
                            FullName =dto.Name ,
                            Username =dto.UserName,
                            Email = dto.Email
                        };
                        await _userCacheRepository.AddUserAsync(user);
                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        await SendEmailFromTemplate(dto.Email!, title, "email_verification_success.cshtml", dto);

                        break;
                    }

                case "password.reset_requested_q":
                    {
                      

                        dto.Token = $"{_client}/reset-password?token={dto.Token}";

                        string title = dto.Title ?? "Reset Password";

                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);

                        await SendEmailFromTemplate(
                            dto.Email!,
                            title,
                            "email_reset_password.cshtml",
                            dto
                        );

                        break;
                    }
                case "password.reset_completed_q":
                    {
                      
                        string title = dto.Title ?? "";
                        dto.Token = $"{_client}/login";
                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);

                        await SendEmailFromTemplate(
                            dto.Email!,
                            title,
                            "email_password_changed.cshtml",
                            dto
                        );

                        break;
                    }

                case "notification.user_banned_q":
                    {

                        string title = dto.Title ?? "Your account has been banned";

                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                        break;
                    }

                case "notification.user_registered_q":
                    {
                        string title = dto.Title ?? "You have successfully registered";



                        //await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        //await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                        break;
                    }
                case "notification.user_unbanned_q":
                    {

                        string title = dto.Title ?? "Your account has been unbanned";


                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                        break;
                    }
                case "notification.email_q":
                    {
                        string title = dto.Title ?? "Thông báo";

                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                        break;
                    }
                case "order.paid_q":
                    {
                        string title = dto.Title ?? "Thông báo";

                        // await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        // await SendEmailFromTemplate(dto.Email!, title, "email_order_paid.cshtml", dto);

                        break;
                    }
                case "order.delivery_q":
                    {
                        // string title = dto.Title ?? "Thông báo";

                        // await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        // await SendEmailFromTemplate(dto.Email!, title, "email_order_paid.cshtml", dto);

                        break;
                    }
                case "order.cancelled_q":
                    {
                        string title = dto.Title ?? "Thông báo";

                        // await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        // await SendEmailFromTemplate(dto.Email!, title, "email_order_paid.cshtml", dto);

                        break;
                    }
                default:
                    {
                        Console.WriteLine($"Không nhận dạng được queue: {queue}");
                        break;
                    }
            }
        }

        private async Task<int> SaveNotificationAsync(string title, string content, int? userId, object metadata)
        {
            var notification = new NotificationDto
            {
                Title = title,
                Content = content,
                CreatedBy = userId,
                IsBroadcast = false
            };

            int notificationId = await _notificationService.AddNotificationAsync(notification);

            var delivery = new NotificationDeliveryDto
            {
                NotificationId = notificationId,
                UserId = userId ?? 0,
                DeliveryMethod = "email",
                Status = 0,
                Metadata = JsonConvert.SerializeObject(metadata)
            };

            await _notificationService.CreateNotificationDeliveryAsync(delivery);

            return notificationId;
        }

        private async Task SendEmailFromTemplate(string email, string title, string template, object model)
        {
            var body = await _templateService.RenderAsync(template, model);
            await _emailService.SendEmailAsync(email, title, body);
        }

    }
}
