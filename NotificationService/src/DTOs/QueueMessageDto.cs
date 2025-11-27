namespace src.DTOs
{
    public class QueueMessageDto
    {
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }
}
