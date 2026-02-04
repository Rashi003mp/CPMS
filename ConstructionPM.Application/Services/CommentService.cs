using ConstructionPM.Application.DTOs.Comments;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Repositories;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Entities.ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;


namespace ConstructionPM.Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly IGenericRepository<Comment> _commentRepo;
        private readonly IGenericRepository<TaskItem> _taskRepository;
        private readonly IProjectAssignmentQueryRepository _projectUserRepository;
        private readonly ICommentRepository _commentRepository;

        public CommentService(
            IGenericRepository<Comment> commentRepo,
            IGenericRepository<TaskItem> taskRepository,
            IProjectAssignmentQueryRepository projectUserRepository,
            ICommentRepository commentRepository
            )
        {
            _commentRepo = commentRepo;
            _taskRepository = taskRepository;
            _projectUserRepository = projectUserRepository;
            _commentRepository = commentRepository;
        }

        // ---------------------------------------------------
        // CREATE COMMENT
        // ---------------------------------------------------
        public async Task<ApiResponse<CommentResponseDto>> CreateAsync(
            CreateCommentInternalDto dto,
            string? traceId)
        {
            try
            {
                // 1. Validate Task
                var task = await _taskRepository.GetByIdAsync(dto.TaskId);
                if (task == null || task.IsDeleted)
                    return ApiResponse<CommentResponseDto>
                        .ErrorResponse("Task not found", traceId);

                // 2. Validate Project Membership
                // Admin bypass
                if (dto.Role == "Admin")
                {
                    // allow without project membership
                }
                else
                {
                    var isProjectUser = await _projectUserRepository
                        .IsUserAlreadyAssignedAsync(task.ProjectId, dto.UserId);

                    if (!isProjectUser)
                        return ApiResponse<CommentResponseDto>
                            .ErrorResponse("You are not a member of this project", traceId);
                }


                // 3. Create Comment (Tracked)
                var comment = new Comment
                {
                    TaskId = dto.TaskId,
                    CommentText = dto.Message.Trim(),
                    CreatedByUserId = dto.UserId,
                    CreatedByUserName = dto.UserName,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                // 4. Persist (SaveChanges happens INSIDE)
                await _commentRepo.AddAsync(comment);

                // 5. Response
                return ApiResponse<CommentResponseDto>.SuccessResponse(
                    new CommentResponseDto
                    {
                        Id = comment.Id,
                        TaskId = comment.TaskId,
                        Message = comment.CommentText
                    },
                    "Comment added successfully",
                    traceId
                );
            }
            catch (System.Exception)
            {
                return ApiResponse<CommentResponseDto>
                    .ErrorResponse("Unexpected error while creating comment", traceId);
            }
        }

        // ---------------------------------------------------
        // GET COMMENTS BY TASK
        // ---------------------------------------------------
        public async Task<ApiResponse<TaskCommentsResponseDto>> GetByTaskAsync(
            int taskId,
            int requestingUserId,
            string? traceId,
            string role)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(taskId);
                if (task == null || task.IsDeleted)
                    return ApiResponse<TaskCommentsResponseDto>
                        .ErrorResponse("Task not found", traceId);

                // Admin can view all comments
                if (role != "Admin" )
                {
                    var isProjectUser = await _projectUserRepository
                        .IsUserAlreadyAssignedAsync(task.ProjectId, requestingUserId);

                    if (!isProjectUser)
                        return ApiResponse<TaskCommentsResponseDto>
                            .ErrorResponse("You are not a member of this project", traceId);
                }


                // READ-ONLY QUERY → AsNoTracking
                var comments = await _commentRepository.GetByTaskIdAsync(taskId);

                var response = new TaskCommentsResponseDto
                {
                    TaskId = taskId,
                    Comments = comments.Select(c => new CommentResponseDto
                    {
                        Id = c.Id,
                        TaskId = c.TaskId,
                        Message = c.CommentText,
                        CreatedByUserId =(int) c.CreatedByUserId,
                        CreatedByUserName = c.CreatedByUserName,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                };
                ;

                return ApiResponse<TaskCommentsResponseDto>.SuccessResponse(
     response,
     "Comments retrieved successfully",
     traceId
 );

            }
            catch (System.Exception)
            {
                return ApiResponse<TaskCommentsResponseDto>
                    .ErrorResponse("Unexpected error while fetching comments", traceId);
            }
        }

        // ---------------------------------------------------
        // DELETE COMMENT (SOFT DELETE)
        // ---------------------------------------------------
        public async Task<ApiResponse> DeleteAsync(
            int commentId,
            int requestingUserId,
            string? traceId)
        {
            try
            {
                // Tracked entity
                var comment = await _commentRepo.GetByIdAsync(commentId);
                if (comment == null)
                    return ApiResponse.ErrorResponse("Comment not found", traceId);

                var task = await _taskRepository.GetByIdAsync(comment.TaskId);
                if (task == null || task.IsDeleted)
                    return ApiResponse.ErrorResponse("Task not found", traceId);

                var projectUser = await _projectUserRepository
                    .GetProjectUserAsync(task.ProjectId, requestingUserId);

                if (projectUser == null)
                    return ApiResponse.ErrorResponse("Access denied", traceId);

                var isOwner = comment.CreatedByUserId == requestingUserId;
                var isProjectManager = projectUser.RoleId == Role.ProjectManager;

                if (!isOwner && !isProjectManager)
                    return ApiResponse.ErrorResponse(
                        "You cannot delete this comment",
                        traceId);

                // Soft delete (tracked entity)
                comment.IsDeleted = true;
                comment.DeletedAt = DateTime.UtcNow;
                comment.DeletedByUserId = requestingUserId;

                // Save via UpdateAsync (entity already tracked, but safe)
                await _commentRepo.UpdateAsync(comment);

                return ApiResponse.SuccessResponse(
                    "Comment deleted successfully",
                    traceId);
            }
            catch (System.Exception)
            {
                return ApiResponse.ErrorResponse(
                    "Unexpected error while deleting comment",
                    traceId);
            }
        }
    }



}
