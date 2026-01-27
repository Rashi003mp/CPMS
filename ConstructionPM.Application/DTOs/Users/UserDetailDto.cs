using ConstructionPM.Application.DTOs.Projects.GetProjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Users
{
    public class UserDetailDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;

        public List<int> Roles { get; set; } = new();
        public List<UserProjectDto> Projects { get; set; } = new();

        public int ActiveProjectCount { get; set; }
    }
}
