using ConstructionPM.Application.DTOs.Comments;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ConstructionPM.API.Hubs;
using System.Security.Claims;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IHubContext<ActivityHub> _hubContext;
        private readonly ITaskService _taskService;

        public CommentsController(
            ICommentService commentService,
            IHubContext<ActivityHub> hubContext,
            ITaskService taskService)
        {
            _commentService = commentService;
            _hubContext = hubContext;
            _taskService = taskService;
        }
        // CREATE COMMENT
        
        [HttpPost("tasks/{taskId}/comments")]
        public async Task<ActionResult<ApiResponse<CommentResponseDto>>> Create(
            int taskId,
            [FromBody] CreateCommentRequestDto dto)
        {
            var traceId = HttpContext.TraceIdentifier;
            var role = User.FindFirstValue(ClaimTypes.Role);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userName = User.FindFirstValue(ClaimTypes.Name)!;

            var internalDto = new CreateCommentInternalDto
            {
                TaskId = taskId,
                UserId = userId,
                UserName = userName,
                Message = dto.Message,
                Role=role,
            };

            var response = await _commentService.CreateAsync(internalDto, traceId);
            
            // Broadcast via SignalR if successful
            if (response.Success && response.Data != null)
            {
                var taskResponse = await _taskService.GetTaskByIdAsync(taskId);
                if (taskResponse != null && taskResponse.Data != null)
                {
                    await _hubContext.Clients.Group($"project_{taskResponse.Data.ProjectId}")
                        .SendAsync("ReceiveComment", new
                        {
                            comment = response.Data,
                            taskId = taskId,
                            projectId = taskResponse.Data.ProjectId,
                            taskTitle = taskResponse.Data.Title
                        });
                }
            }
            
            return StatusCode(response.StatusCode, response);
        }

        // GET COMMENTS BY TASK
        [HttpGet("tasks/{taskId}/comments")]
        public async Task<ActionResult<ApiResponse<TaskCommentsResponseDto>>> GetByTask(
            int taskId)
        {
            var traceId = HttpContext.TraceIdentifier;
            var role = User.FindFirstValue(ClaimTypes.Role);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _commentService.GetByTaskAsync(
                taskId,
                userId,
                traceId,
                role);

            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }

        // DELETE COMMENT
        [HttpDelete("comments/{id}")]
        public async Task<ActionResult<ApiResponse>> Delete(int id)
        {
            var traceId = HttpContext.TraceIdentifier;

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _commentService.DeleteAsync(
                id,
                userId,
                traceId);

            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }
    }
}
