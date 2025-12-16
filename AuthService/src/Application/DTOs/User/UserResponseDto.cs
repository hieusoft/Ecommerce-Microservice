using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
    
        public string UserName { get; set; }
        public string Email { get; set; }
        public bool EmailVerified { get; set; }
        public bool IsBanned { get; set; } = false;
        public List<string> Roles { get; set; } = new List<string>();
    }
}
