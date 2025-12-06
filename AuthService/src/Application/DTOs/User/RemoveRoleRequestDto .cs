using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class RemoveRoleRequestDto
    {
        public string EmailOrUsername { get; set; }
        public string RoleName { get; set; }
    }
}
