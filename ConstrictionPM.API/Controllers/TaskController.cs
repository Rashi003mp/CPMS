using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.TaskManager;
using ConstructionPM.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/CreateTask")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask(CreateTaskDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(
                    ApiResponse<object>.ErrorResponse("Invalid token")
                );
            }

            var currentUserId = int.Parse(userIdClaim.Value);

            var response =
                await _taskService.CreateTaskAsync(dto, currentUserId);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }

}
