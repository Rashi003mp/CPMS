using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Projects.CreateProject
{
    public class ProjectListDto
    {
        public int Id { get; set; }
        public string ProjectName { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}
