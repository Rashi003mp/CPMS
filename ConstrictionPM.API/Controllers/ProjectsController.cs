using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,ProjectManager,Client")]  
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IProjectUsersService _projectUserService;  

        public ProjectsController(IProjectService projectService, IProjectUsersService projectUserService)
        {
            _projectService = projectService;
            _projectUserService = projectUserService;
        }

        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse>> Create([FromForm] CreateProjectDto dto)
        {
            var response = await _projectService.CreateAsync(dto);  
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet]  // ✅ List projects
        public async Task<ActionResult<ApiResponse<PaginatedResult<ProjectDto>>>> GetAllProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] ProjectStatus? status = null)
        {
            var response = await _projectService.GetAllAsync(page, pageSize, search, status);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("user/{userId:int}")]
        [Authorize(Roles = "Admin,ProjectManager,Client")]
        public async Task<ActionResult<ApiResponse<PaginatedResult<ProjectDto>>>> GetProjectsByUserId(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] ProjectStatus? status = null)
        {
            // Get current user id from token
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(currentUserIdStr, out int currentUserId) || currentUserId <= 0)
            {
                return Unauthorized(ApiResponse<PaginatedResult<ProjectDto>>
                    .ErrorResponse("Invalid user token", 401));
            }

            // Only allow users to see their own projects unless they're Admin
            if (!User.IsInRole("Admin") && userId != currentUserId)
            {
                return StatusCode(403, ApiResponse<PaginatedResult<ProjectDto>>
                    .ErrorResponse("You are not allowed to access other users' projects", 403));
            }

            var response = await _projectService.GetProjectsByUserIdAsync(userId, page, pageSize, search, status);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,ProjectManager,Client")]

        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProjectById(
            int id,
            [FromQuery] int? userId = null)
        {
            // 1️⃣ Get current user id from token
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(currentUserIdStr, out int currentUserId) || currentUserId <= 0)
            {
                return Unauthorized(ApiResponse<ProjectDto>
                    .ErrorResponse("Invalid user token", 401));
            }

            // 2️⃣ Determine target user
            int targetUserId = currentUserId;

            if (User.IsInRole("Admin") && userId.HasValue)
            {
                targetUserId = userId.Value;
            }
            else if (userId.HasValue && userId != currentUserId) 
            {
                return StatusCode(403, ApiResponse<ProjectDto>
                    .ErrorResponse("You are not allowed to access other users' projects", 403));
            }

            // 3️⃣ Pass role to service
            var role = User.FindFirstValue(ClaimTypes.Role);

            var response = await _projectService
                .GetByIdAsync(id, targetUserId, role);

            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse>> UpdateProject(int id, [FromForm] UpdateProjectDto dto) 
        {
            var response = await _projectService.UpdateProjectAsync(id, dto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse>> DeleteProject(int id, [FromQuery] string reason) 
        {
            var response = await _projectService.DeleteProjectAsync(id, reason);
            return StatusCode(response.StatusCode, response);
        }
    }
}
