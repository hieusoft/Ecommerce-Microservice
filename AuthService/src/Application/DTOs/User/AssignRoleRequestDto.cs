using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class AssignRoleRequestDto
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}
