using src.Models;

namespace src.DTOs
{
    public class NotificationDto
    {
      
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }
        public bool IsBroadcast { get; set; } = false;

    
        public List<UserDto> Users { get; set; } = new List<UserDto>();

      
        public NotificationDto(Notification n)
        {
        
            Title = n.Title;
            Content = n.Content;
            CreatedBy = n.CreatedBy;
            IsBroadcast = n.IsBroadcast;
        }

        public NotificationDto() { }
    }
}
