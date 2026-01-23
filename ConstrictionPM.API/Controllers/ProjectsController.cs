using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
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
        private readonly IProjectUsersService _projectUserService;

        public ProjectsController(IProjectService projectService, IProjectUsersService projectUserService)
        {
            _projectService = projectService;
            _projectUserService = projectUserService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDto dto)
        {
            var projectId = await _projectService.CreateAsync(dto);
            var response = ApiResponse.SuccessResponse("Project created successfully");
            return Ok(response);
            ;
        }

        [HttpPost("{projectId}/assign-user")]
        public async Task<IActionResult> AssignUserToProject(int projectId, AssignProjectUserDto dto)
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
    }
}
