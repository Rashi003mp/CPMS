using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Users
{
    public class UserListDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int ActiveProjectCount { get; set; }
    }

}
