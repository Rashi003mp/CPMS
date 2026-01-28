using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize(Roles = "Admin,ProjectManager")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService, IProjectUsersService projectUserService)
        {
            _projectService = projectService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<IActionResult>
            Create
            (
            CreateProjectDto dto
            )

        {
            var projectId = await _projectService.CreateAsync(dto);
            var response = ApiResponse.SuccessResponse("Project created successfully");
            return Ok(response);
            ;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<ActionResult<ApiResponse<PaginatedResult<ProjectDto>>>>
            GetAllProjects
            (
             [FromQuery] int page = 1,
             [FromQuery] int pageSize = 10,
             [FromQuery] string? search = null,
             [FromQuery] ProjectStatus? status = null
            )
        {
            var result = await _projectService.GetAllAsync(page, pageSize, search, status);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,ProjectManager")]
        [Route("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProjectById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project == null)
            {
                return NotFound(project);
            }
            return Ok(project);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<IActionResult> UpdateProject(int id, [FromForm] UpdateProjectDto dto)
        {
            var result = await _projectService.UpdateProjectAsync(id, dto);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<IActionResult> DeleteProject(int id, string Reason)
        {
            var result = await _projectService.DeleteProjectAsync(id, Reason);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
