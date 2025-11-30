using Microsoft.EntityFrameworkCore;
using src.Data;
using src.DTOs;
using src.Interfaces;
using src.Models;
using System.Text.Json;

namespace src.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IRabbitMqService _rabbitMqService;

        public NotificationService(IUnitOfWork unitOfWork, IEmailService emailService, IRabbitMqService rabbitMqService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _rabbitMqService = rabbitMqService;
        }

        public async Task<NotificationDto> CreateNotificationAsync(NotificationDto dto)
        {
          
            var notification = new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = dto.CreatedBy,
                IsBroadcast = dto.IsBroadcast
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.CommitAsync();

            if (dto.IsBroadcast)
            {
                var message = new
                {
                    NotificationId = notification.NotificationId,
                  
                };

                string jsonMessage = JsonSerializer.Serialize(message);
            }
            if (dto.Users != null && dto.Users.Count > 0)
            {
                foreach (var user in dto.Users)
                {
                    var message = new
                    {
                        NotificationId = notification.NotificationId,
                        UserId = user.UserId,
                        Email = user.Email,
                        Name = user.Name,
                        Title = notification.Title,
                        Content = notification.Content
                    };

                    _rabbitMqService.Publish(
                        exchangeName: "notification_events",
                        routingKey: "notification.email",
                        message: message 
                    );
                }

            }

            return new NotificationDto(notification);
            
        }


        public async Task<NotificationDto?> GetByIdAsync(int notificationId)

        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
            if (notification == null) return null;
            return new NotificationDto(notification);
        }
        public async Task<List<NotificationDto>> GetAllAsync()
        {
            var notifications = await _unitOfWork.Notifications.GetAllAsync();
            return notifications.Select(n => new NotificationDto(n)).ToList();
        }

        public async Task DeleteNotificationAsync(int notificationId)
        {
            await _unitOfWork.Notifications.DeleteAsync(notificationId);
            await _unitOfWork.CommitAsync();
        }

      
       

        //public async Task<NotificationDeliveryDto> CreateSystemNotificationAsync(NotificationDeliveryDto dto)
        //{
        //    using var transaction = await _unitOfWork.BeginTransactionAsync();
        //    try
        //    {
        //        var notification = new Notification
        //        {
        //            //Title = dto.,
        //            //Content = dto.Content,
        //            //CreatedAt = DateTime.UtcNow,
        //            IsBroadcast = true
        //        };
        //        await _unitOfWork.Notifications.AddAsync(notification);

        //        NotificationDelivery? notificationDelivery = null;

        //        if (dto.UserId.HasValue || !string.IsNullOrEmpty(dto.DeliveryMethod))
        //        {
        //            var delivery = await _unitOfWork.NotificationDelivery
        //                .GetDeliveryMethodByNameAsync(dto.DeliveryMethod);
        //            if (delivery == null)
        //                throw new Exception($"Delivery method '{dto.DeliveryMethod}' không tồn tại.");

        //            notificationDelivery = new NotificationDelivery
        //            {
        //                //UserId = dto.UserId,
        //                Notification = notification,
        //                DeliveryMethodId = delivery.DeliveryMethodId,
        //                Status = 0,
        //                CreatedAt = DateTime.UtcNow,
        //                Metadata = dto.Metadata ?? JsonSerializer.Serialize(new { Queue = "manual", SentSuccess = true })
        //            };
        //            await _unitOfWork.NotificationDelivery.AddAsync(notificationDelivery);

        //            // Nếu là email thì gửi
        //            //if (dto.DeliveryMethod.ToLower() == "email" && !string.IsNullOrEmpty(dto.Email))
        //            //{
        //            //    //await _emailService.SendEmailAsync(dto.Email, dto.Title, dto.Content);
        //            //}
        //        }

        //        await transaction.CommitAsync();
        //        return new NotificationDeliveryDto(notificationDelivery); 
               

        //    }
        //    catch
        //    {
        //        await transaction.RollbackAsync();
        //        throw;
        //    }
        //}

        public async Task<List<NotificationDeliveryDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _unitOfWork.NotificationDelivery.GetByUserIdAsync(userId);
            return notifications.Select(n => new NotificationDeliveryDto(n)).ToList();
        }

        public async Task<NotificationDeliveryDto?> GetUserNotificationByIdAsync(int userNotificationId)
        {
            var n = await _unitOfWork.NotificationDelivery.GetByIdAsync(userNotificationId);
            if (n == null) return null;
            return new NotificationDeliveryDto(n);
        }


        public async Task<NotificationDeliveryDto> CreateNotificationDeliveryAsync(NotificationDeliveryDto dto)
        {
            try
            {
                var notification = await _unitOfWork.Notifications.GetByIdAsync(dto.NotificationId);
                if (notification == null)
                    throw new KeyNotFoundException($"Notification with ID {dto.NotificationId} not found.");
                // 1. Kiểm tra DeliveryMethodId hợp lệ
                var deliveryMethod = await _unitOfWork.NotificationDelivery
                    .GetDeliveryMethodByNameAsync(dto.DeliveryMethod);

                if (deliveryMethod == null)
                    throw new KeyNotFoundException($"Delivery method '{dto.DeliveryMethod}' not found.");

             
                var notificationDelivery = new NotificationDelivery
                {
                    NotificationId = dto.NotificationId,
                    UserId = dto.UserId,
                    DeliveryMethodId = deliveryMethod.DeliveryMethodId,
                    Status = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // 3. Lưu database
                await _unitOfWork.NotificationDelivery.AddAsync(notificationDelivery);
                await _unitOfWork.CommitAsync();

                // 4. Trả DTO
                return new NotificationDeliveryDto(notificationDelivery);
            }
            catch (KeyNotFoundException)
            {
                throw;   // Controller sẽ catch và trả 404
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to create notification delivery: " + ex.Message);
            }
        }


        public async Task<NotificationDto> UpdateNotificationAsync(int notificationId, NotificationDto dto)
        {
            try
            {
               
                var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
                if (notification == null)
                    throw new KeyNotFoundException($"Notification with ID {notificationId} not found.");

                notification.Title = dto.Title ?? notification.Title;
                notification.Content = dto.Content ?? notification.Content;
                notification.IsBroadcast = dto.IsBroadcast;
                notification.UpdatedAt = DateTime.UtcNow;           
                await _unitOfWork.Notifications.UpdateAsync(notification);
                await _unitOfWork.CommitAsync();
                return new NotificationDto(notification);
            }
        
            catch (Exception ex)
            {
                
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        public async Task<int> AddNotificationAsync(NotificationDto dto)
        {
            var notification = new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = dto.CreatedBy,
                IsBroadcast = dto.IsBroadcast
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.CommitAsync();



            return notification.NotificationId;
        }
    }
}
