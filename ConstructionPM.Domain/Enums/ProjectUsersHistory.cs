using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Domain.Enums
{
    public class ProjectUsersHistory : BaseEntity
    {
        public int ProjectUserId { get; set; }

        public int ProjectId { get; set; }
        public int RoleId { get; set; }

        public int AssignedUserId { get; set; }
        public string AssignedUserName { get; set; } = null!;

        public string Action { get; set; } = null!;
        public string? Reason { get; set; }
    }
}
