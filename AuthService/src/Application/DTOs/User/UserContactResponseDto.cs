using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class UserContactResponseDto
    {
        public int ContactId { get; set; }
        public int UserId { get; set; }
        public string AddressLine { get; set; } = string.Empty;
        public string? City { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
