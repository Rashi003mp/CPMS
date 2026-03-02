using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace ConstructionPM.Application.DTOs.Projects
{
    public class UpdateProjectDto
    {
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ProjectStatus? Status { get; set; }
        public string? Remarks { get; set; }

        // Optional new image upload
        public IFormFile? Image { get; set; }
        
        // Flag to remove existing image
        public bool RemoveImage { get; set; }
    }
}
