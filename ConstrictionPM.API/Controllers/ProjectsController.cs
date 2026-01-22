using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDto dto)
        {
            var projectId = await _projectService.CreateAsync(dto);
            var response = ApiResponse.SuccessResponse("Project created successfully");
            return Ok(response);
            ;
        }
    }
}
