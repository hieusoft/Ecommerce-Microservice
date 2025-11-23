namespace src.Models
{
    public class DeliveryMethod
    {
        public int DeliveryMethodId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

    
        public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
    }
}
