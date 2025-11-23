namespace src.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public bool IsSystem { get; set; } = false;

        // Navigation property
        public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
    }

}
