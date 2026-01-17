using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ConstrictionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {

        private readonly IProjectService _service;

        public ProjectsController(IProjectService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<IActionResult> Create([FromForm] CreateProjectDto request)
        {
            await _service.CreateAsync(request);
            return Ok(ApiResponse.SuccessResponse("Project created successfully"));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var project = await _service.GetByIdAsync(id);

            return Ok(
            ApiResponse<Project>.SuccessResponse(
            project,
            "Project retrieved successfully",
            HttpContext.TraceIdentifier)
             );
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _service.GetAllAsync();
            return Ok(
                ApiResponse<IEnumerable<Project>>.SuccessResponse(
                    projects, "Projects retrieved successfully")
                );

        }

    }
}
