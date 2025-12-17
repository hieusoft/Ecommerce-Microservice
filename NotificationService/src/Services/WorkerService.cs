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
                            UserId =  dto.UserId ?? 0,
                            FullName =dto.FullName ,
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
                        if (dto == null)
                        {
                            Console.WriteLine("DTO is null, skipping message.");
                            break;
                        }

                        if (dto.UserId == null)
                        {
                            Console.WriteLine("DTO.UserId is null, cannot process user banned notification.");
                            break;
                        }

                        var supportUrl = $"{_client}/support";

                        var user = await _userCacheRepository.GetUserByIdAsync(dto.UserId.Value);
                        if (user == null)
                        {
                            Console.WriteLine($"User with ID {dto.UserId.Value} not found.");
                            break;
                        }

                     
                        dto.UserName = user.Username ?? "User";
                        dto.Token = supportUrl;
                        dto.Email ??= user.Email ?? ""; 

                        string title = dto.Title ?? "Your account has been banned";
                        string content = dto.Content ?? "Your account has been banned due to policy violations.";

                        await SaveNotificationAsync(title, content, dto.UserId, dto);

                        if (!string.IsNullOrEmpty(dto.Email))
                        {
                            await SendEmailFromTemplate(dto.Email, title, "email_ban_user.cshtml", dto);
                        }
                        else
                        {
                            Console.WriteLine("Email is null or empty, skipping email sending.");
                        }

                        break;
                    }

                case "notification.user_unbanned_q":
                    {
                        if (dto == null)
                        {
                            Console.WriteLine("DTO is null, skipping message.");
                            break;
                        }

                        if (dto.UserId == null)
                        {
                            Console.WriteLine("DTO.UserId is null, cannot process user unbanned notification.");
                            break;
                        }

                        var loginUrl = $"{_client}/login";

                        var user = await _userCacheRepository.GetUserByIdAsync(dto.UserId.Value);
                        if (user == null)
                        {
                            Console.WriteLine($"User with ID {dto.UserId.Value} not found.");
                            break;
                        }

                        dto.UserName = user.Username ?? "User";
                        dto.Token = loginUrl;
                        dto.Email ??= user.Email ?? "";

                        string title = dto.Title ?? "Your account has been unbanned";
                        string content = dto.Content ?? "Your account has been unbanned and is now active.";

                      
                        await SaveNotificationAsync(title, content, dto.UserId, dto);

                      
                        if (!string.IsNullOrEmpty(dto.Email))
                        {
                            await SendEmailFromTemplate(dto.Email, title, "email_unban_user.cshtml", dto);
                        }
                        else
                        {
                            Console.WriteLine("Email is null or empty, skipping email sending.");
                        }

                        break;
                    }

                //case "notification.user_registered_q":
                //    {
                //        string title = dto.Title ?? "You have successfully registered";



                //        //await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                //        //await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                //        break;
                //    }

                case "notification.email_q":
                    {
                        string title = dto.Title ?? "Thông báo";

                        await SaveNotificationAsync(title, dto.Content ?? "", dto.UserId, dto);
                        await SendEmailFromTemplate(dto.Email!, title, "email_promotion.cshtml", dto);

                        break;
                    }
                case "order.cancelled_q":
                    {
                        if (dto == null)
                        {
                            Console.WriteLine("DTO is null, skipping order cancelled notification.");
                            break;
                        }

                        if (dto.UserId == null)
                        {
                            Console.WriteLine("DTO.UserId is null, cannot process order cancelled notification.");
                            break;
                        }

                        string title = dto.Title ?? "Order Cancelled";
                        string content = dto.Content ?? $"Your order {dto.OrderCode} has been cancelled. Total amount: ${dto.TotalPrice}.";

                        var user = await _userCacheRepository.GetUserByIdAsync(dto.UserId.Value);
                        if (user == null)
                        {
                            Console.WriteLine($"User with ID {dto.UserId.Value} not found.");
                            break;
                        }

                        dto.UserName = user.Username ?? "User";
                        dto.Email ??= user.Email ?? "";

                        Console.WriteLine(dto.Items);

                      
                        await SaveNotificationAsync(title, content, dto.UserId, dto);

                        if (!string.IsNullOrEmpty(dto.Email))
                        {
                            await SendEmailFromTemplate(dto.Email, title, "email_order_cancelled.cshtml", dto);
                        }
                        else
                        {
                            Console.WriteLine("Email is null or empty, skipping email sending.");
                        }

                        break;
                    }



                case "order.delivery_q":
                    {
                        // string title = dto.Title ?? "Thông báo";

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
