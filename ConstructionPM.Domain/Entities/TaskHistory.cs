using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Entities
{
    using System;

    namespace ConstructionPM.Domain.Entities
    {
        public class TasksHistory : BaseEntity
        {

            public int TaskId { get; set; }

            public int ProjectId { get; set; }

            public string Title { get; set; } = null!;

            public string? Description { get; set; }

            public int? AssignedToUserId { get; set; }

            public int Status { get; set; }   

            public DateTime? DueDate { get; set; }

            
            public string Action { get; set; } = null!;
            public string? Reason { get; set; }

           
        }
    }

}
