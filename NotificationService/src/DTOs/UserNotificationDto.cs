namespace src.DTOs
{
    public class UserNotificationDto
    {
        public int UserNotificationId { get; set; }
        public int UserId { get; set; }
        public NotificationDto Notification { get; set; } = null!;
        public int Status { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public int DeliveryMethodId { get; set; }
        public string? Metadata { get; set; }
    }
}
