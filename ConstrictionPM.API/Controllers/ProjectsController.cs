using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles= "Admin,ProjectManager")]
        public async Task<IActionResult> Create([FromForm]CreateProjectDto request)
        {
            await _service.CreateAsync(request);
            return Ok();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var projects = await _service.GetByIdAsync(id);

            return projects == null ? NotFound() : Ok(projects);

        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var project=await _service.GetAllAsync();
            return Ok(project);

        }

    }
}
