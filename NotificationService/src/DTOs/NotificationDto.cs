namespace src.DTOs
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsSystem { get; set; }
    }
}
