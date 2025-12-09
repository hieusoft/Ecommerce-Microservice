using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class UserQueryModelDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;

        public string? Search { get; set; }

       
        public string? Role { get; set; }

       
        public bool? EmailVerified { get; set; }

        
        public bool? IsBanned { get; set; }

        public string? Sort { get; set; }
    }
}
