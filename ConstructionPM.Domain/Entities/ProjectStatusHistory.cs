using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Entities
{
    public class ProjectStatusHistory : BaseEntity
    {
        public int ProjectId { get; set; }

        public ProjectStatus Status { get; set; }

        public string? Remarks { get; set; }
    }
}
