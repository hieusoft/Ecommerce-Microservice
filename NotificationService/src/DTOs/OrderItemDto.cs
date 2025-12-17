namespace src.DTOs
{
    public class OrderItemDto
    {
        public int? OrderItemId { get; set; }
        public int? OrderId { get; set; }
        public string? BouquetId { get; set; }
        public string? BouquetName { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
    }
}
