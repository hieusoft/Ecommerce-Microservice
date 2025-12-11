using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class UpdateRecipientInfoRequestDto
    {
        public int RecipientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string AddressLine { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
    }
}
