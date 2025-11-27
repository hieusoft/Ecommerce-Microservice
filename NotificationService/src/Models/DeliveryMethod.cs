namespace src.Models
{
    public class DeliveryMethod
    {
        public int DeliveryMethodId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

      
        public ICollection<NotificationDelivery> NotificationDeliveries { get; set; } = new List<NotificationDelivery>();
    }
}
