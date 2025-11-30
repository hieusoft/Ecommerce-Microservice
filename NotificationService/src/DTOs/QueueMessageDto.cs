namespace src.DTOs
{
    public class QueueMessageDto

    {
        public int? UserId { get; set; }
        public int? NotificationId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }

        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? Metadata { get; set; }
    }
}
