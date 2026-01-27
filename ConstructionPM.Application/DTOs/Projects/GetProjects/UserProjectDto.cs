using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Projects.GetProjects
{
    public class UserProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = null!;
        public int ProjectStatus { get; set; }
        public int UserRoleInProject { get; set; }
    }
}
