namespace src.DTOs
{
    public class SendNotificationDto
    {
        public int NotificationId { get; set; }
        public List<int> UserIds { get; set; } = new List<int>();
        public int DeliveryMethodId { get; set; }  // Email, InApp, Push, SMS
    }
}
