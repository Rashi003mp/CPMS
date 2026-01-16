using ConstructionPM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ConstructionPM.Application.DTOs
{
    public class CreateProjectDto

    {
        [Required]
        public string ProjectName { get; set; } = null!;


        [Required]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime? EndDate { get; set; }

        [Required]
        public ProjectStatus Status { get; set; }
    }
}
