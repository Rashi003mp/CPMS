using ConstructionPM.Domain.Enums;

namespace ConstructionPM.Domain.Entities
{
    public class ProjectUsers : BaseEntity
    {
        public int ProjectId { get; set; }
        public Role? RoleId { get; set; }

        public int AssignedUserId { get; set; }

        public string? AssignedUserName { get; set; }

        public string? Action { get; set; }

        public string? Reason { get; set; }
    }
}
