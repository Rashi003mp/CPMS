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

        public int OldStatus { get; set; }

        public int NewStatus { get; set; }

        public DateTime ChangedAt { get; set; }

        public int ChangedByUserId { get; set; }
    }
}
