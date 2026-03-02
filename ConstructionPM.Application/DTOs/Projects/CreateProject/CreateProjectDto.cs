using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ConstructionPM.Application.DTOs.Projects.CreateProject
{
    public class CreateProjectDto
    {
        [Required]
        public string ProjectName { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }

        [Required]
        public ProjectStatus Status { get; set; }

        // Optional image upload
        public IFormFile? Image { get; set; }
    }
}
