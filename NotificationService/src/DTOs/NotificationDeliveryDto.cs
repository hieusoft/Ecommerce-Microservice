using src.Models;

namespace src.DTOs
{
    public class NotificationDeliveryDto
    {
       
        public int NotificationId { get; set; }       
        public int UserId { get; set; }               
        public string DeliveryMethod { get; set; }     
        public int Status { get; set; }                
       
        public string? Metadata { get; set; } 
         public NotificationDto? Notification { get; set; }
      
        public NotificationDeliveryDto() { }

        public NotificationDeliveryDto(NotificationDelivery entity)
        {
          
            NotificationId = entity.NotificationId;
            UserId = entity.UserId;
            DeliveryMethod = entity.DeliveryMethod?.Name ?? "";
            Status = entity.Status;
            Metadata = entity.Metadata;
            Notification = new NotificationDto
            {
                Title = entity.Notification.Title,
                Content = entity.Notification.Content,
                CreatedBy = entity.Notification.CreatedBy,
                IsBroadcast = entity.Notification.IsBroadcast,

            };

        }
    }
}
