using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Projects
{
    public class UpdateProjectDto
    {
        public string ProjectName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public ProjectStatus Status { get; set; }
        public string? Remarks { get; set; }
    }
}
