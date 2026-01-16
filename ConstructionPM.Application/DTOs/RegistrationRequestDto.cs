using ConstructionPM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ConstructionPM.Application.DTOs
{
    public class RegistrationRequestDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength (10)]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public RegistrationRole RoleName { get; set; }
        // PM
        public int? ExperienceYears { get; set; }

        // Engineer
        public string? Skills { get; set; }

        // Client
        public string? ProjectName { get; set; }
    }




}


