namespace src.DTOs
{
    public class CreateNotificationDto
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int? CreatedBy { get; set; }  
        public bool IsSystem { get; set; } = false;
    }
}
