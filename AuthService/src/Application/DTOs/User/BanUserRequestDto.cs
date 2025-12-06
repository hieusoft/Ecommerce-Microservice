using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User
{
    public class BanUserRequestDto
    {
        public string EmailOrUsername { get; set; } = string.Empty;
    }
}
