
using System;

namespace src.Models
{
    public class UserNotification
    {
        public int UserNotificationId { get; set; }
        public int UserId { get; set; }
        public int NotificationId { get; set; }
        public int Status { get; set; } = 0;         
        public DateTime? SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public int DeliveryMethodId { get; set; }
        public string? Metadata { get; set; }

        public Notification Notification { get; set; } = null!;
        public DeliveryMethod DeliveryMethod { get; set; } = null!;
    }

}
