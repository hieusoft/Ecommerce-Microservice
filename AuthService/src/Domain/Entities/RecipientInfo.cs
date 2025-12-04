using System;

namespace Domain.Entities
{
    public class RecipientInfo
    {
        public int RecipientId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;

        public string AddressLine { get; set; } = string.Empty;
        public string? City { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
    }
}
