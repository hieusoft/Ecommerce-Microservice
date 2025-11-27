
using System;

namespace src.Models
{
    public class NotificationDelivery
    {
        public int NotificationDeliveryId { get; set; }
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public int DeliveryMethodId { get; set; }

        public int Status { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? Metadata { get; set; }

   
        public Notification Notification { get; set; } = null!;
        public DeliveryMethod DeliveryMethod { get; set; } = null!;
    }

}
