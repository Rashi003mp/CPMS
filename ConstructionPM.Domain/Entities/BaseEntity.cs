using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }

        public DateTime? ModifiedAt { get; set; }
        public int? ModifiedByUserId { get; set; }
        public string? ModifiedByUserName { get; set; }

        public DateTime? DeletedAt { get; set; }
        public int? DeletedByUserId { get; set; }
        public string? DeletedByUserName { get; set; }

        public bool IsDeleted { get; set; }
    }
}
