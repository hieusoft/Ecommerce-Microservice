namespace src.DTOs
{
    public class QueueMessageDto

    {
        public int? UserId { get; set; }
        public int? NotificationId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; }

        public string? OrderCode { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? Discount { get; set; }
        public string? CouponCode { get; set; }
        public decimal? VatAmount { get; set; }
        public decimal? ShippingFee { get; set; }
        public string? Message { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? DeliveryTime { get; set; }

       
        public string? Metadata { get; set; }

       
        public List<OrderItemDto>? Items { get; set; }

    }
}
