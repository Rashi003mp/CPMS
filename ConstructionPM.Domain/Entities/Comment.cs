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
        public class Comment : BaseEntity
        {

            public int TaskId { get; set; }

            public string CommentText { get; set; } = null!;
            // Navigation (optional but recommended)
            public TaskItem Task { get; set; } = null!;
        }
    }

}
