using ConstructionPM.Domain.Enums;


namespace ConstructionPM.Domain.Entities
{
    public class RegistrationRequest
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;

        public string Phone { get; set; } = null!;
        public string? RoleName { get; set; }

        public string? RejectionReason { get; set; }
        public int? ExperienceYears { get; set; }   // PM / Engineer
        public string? Skills { get; set; }          // Engineer

        public string? ProjectName { get; set; }     // Client

        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
