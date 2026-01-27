using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Mvc;


namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IProjectUsersService _projectUserService;

        public ProjectsController(IProjectService projectService, IProjectUsersService projectUserService)
        {
            _projectService = projectService;
            _projectUserService = projectUserService;
        }

        [HttpPost]
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

        [HttpPost("{projectId}/assign-user")]
        public async Task<IActionResult>
            AssignUserToProject
            (
            int projectId, AssignProjectUserDto dto
            )

        {
            var result = await _projectUserService.AssignUserToProjectAsync(projectId, dto);
            if (!result.Success)
            {
                return BadRequest(result);

            }
            else
            {
                return Ok(result);
            }


        }

        [HttpGet]
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
        [Route("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProjectById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project == null)
            {
                return NotFound(ApiResponse<ProjectDto>.ErrorResponse("Project not found"));
            }
            return Ok(ApiResponse<ProjectDto>.SuccessResponse(project));



        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, UpdateProjectDto dto)
        {
            var result = await _projectService.UpdateProjectAsync(id, dto);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id, string Reason)
        {
            var result = await _projectService.DeleteProjectAsync(id,Reason);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
