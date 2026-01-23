using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Projects.ProjectUsers
{
    public class AssignProjectUserDto
    {
        public Role Role { get; set; }
        public int AssignedUserId { get; set; }
        public string AssignedUserName { get; set; }
    }
}
