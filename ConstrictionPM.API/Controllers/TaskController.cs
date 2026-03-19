using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.TaskManager;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.API.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/CreateTask")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IHubContext<ActivityHub> _hubContext;

        public TaskController(ITaskService taskService, IHubContext<ActivityHub> hubContext)
        {
            _taskService = taskService;
            _hubContext = hubContext;
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

        // UPDATE Task
        [HttpPut("update")]
        public async Task<IActionResult> UpdateTask([FromBody] UpdateTaskDto dto)
        {
            var result = await _taskService.UpdateTaskAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            // Fetch the updated task to get its ProjectId and broadcast
            var updatedTask = await _taskService.GetTaskByIdAsync(dto.TaskId);
            if (updatedTask != null && updatedTask.Data != null)
            {
                await _hubContext.Clients.Group($"project_{updatedTask.Data.ProjectId}")
                    .SendAsync("TaskUpdated", updatedTask.Data);
            }

            return Ok(result);
        }

        // DELETE Task
        [HttpDelete("delete/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId, [FromQuery] string? reason)
        {
            var result = await _taskService.DeleteTaskAsync(taskId, reason);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        //  GET Task by ID
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskById(int taskId)
        {
            var result = await _taskService.GetTaskByIdAsync(taskId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        //GET all tasks for a project
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetTasksByProject(int projectId)
        {
            var result = await _taskService.GetTasksByProjectAsync(projectId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }

}
