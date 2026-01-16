using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Entities
{
    public class Project : BaseEntity
    {
        public string ProjectName { get; set; } = null!;

        public string Description { get; set; } = null!;

        public string Status { get; set; } = null!;

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }
}
