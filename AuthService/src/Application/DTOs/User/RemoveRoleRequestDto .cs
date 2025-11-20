using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class RemoveRoleRequestDto
    {
        public int UserId { get; set; }
        public string RoleName { get; set; }
    }
}
