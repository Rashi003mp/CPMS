using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.TaskManager;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Entities.ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;

namespace ConstructionPM.Application.Services
{

    public class TaskService : ITaskService
    {

        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IProjectAssignmentQueryRepository _projectAssignmentQueryRepository;
        private readonly IGenericRepository<TaskItem> _taskRepository ;
        private readonly IGenericRepository<TasksHistory> _TasksHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TaskService(
            IGenericRepository<Project> projectRepository,
            IGenericRepository<User> userRepository,
            IProjectAssignmentQueryRepository projectAssignmentQueryRepository,
            IGenericRepository<TaskItem> taskRepository,
            IUnitOfWork unitOfWork,
            IGenericRepository<TasksHistory> genericRepositoryTasksHistory
            )
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _projectAssignmentQueryRepository = projectAssignmentQueryRepository;
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _TasksHistoryRepository = genericRepositoryTasksHistory;

        }

        

        public async Task<ApiResponse<object>> CreateTaskAsync(CreateTaskDto dto, int currentUserId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
                if (project == null || project.IsDeleted)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("Project not found");
                }

                var creator = await _userRepository.GetByIdAsync(currentUserId);
                if (creator == null || creator.IsDeleted || !creator.IsActive)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("Invalid or inactive user");
                }

                var creatorRole = await _projectAssignmentQueryRepository
                                        .GetUserRoleInProjectAsync(dto.ProjectId, currentUserId);

                if (creator.RoleId != 0)
                {
                    if (creatorRole == null)
                    {
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse<object>.ErrorResponse(
                            "You are not assigned to this project"
                        );
                    }
                    if (creatorRole.RoleId != Role.ProjectManager)
                    {
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse<object>.ErrorResponse(
                            "You are not allowed to create tasks"
                        );
                    }
                }

                var isAssigned = await _projectAssignmentQueryRepository
                    .IsUserAlreadyAssignedAsync(dto.ProjectId, dto.AssignedToUserId);

                if (!isAssigned)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse(
                        "Assigned user does not belong to this project"
                    );
                }

                if (dto.DueDate.Date < DateTime.UtcNow.Date)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse(
                        "Due date cannot be in the past"
                    );
                }

                // Create the task
                var task = new TaskItem
                {
                    ProjectId = dto.ProjectId,
                    Title = dto.Title.Trim(),
                    Description = dto.Description,
                    AssignedToUserId = dto.AssignedToUserId,
                    DueDate = dto.DueDate,
                    Status = DomainTaskStatus.Todo,
                };

                await _taskRepository.AddAsync(task);
                await _unitOfWork.SaveChangesAsync(); // Save to get TaskId

                // Create history record for task creation
                var taskHistory = new TasksHistory
                {
                    TaskId = task.Id,
                    ProjectId = task.ProjectId,
                    Title = task.Title,
                    Description = task.Description,
                    AssignedToUserId = task.AssignedToUserId,
                    Status = (int)task.Status,
                    DueDate = task.DueDate,
                    Action = "Created",
                    Reason = "Initial task creation"
                };

                await _TasksHistoryRepository.AddAsync(taskHistory);

                await _unitOfWork.CommitAsync();

                return ApiResponse<object>.SuccessResponse(
                    "Task created successfully"
                );
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse<object>.ErrorResponse(
                    $"Unable to create task: {ex.Message}"
                );
            }
        }

        // DELETE
        public async Task<ApiResponse> DeleteTaskAsync(int taskId, string? reason)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var task = await _taskRepository.GetByIdAsync(taskId);
                if (task == null || task.IsDeleted)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("Task not found");
                }

                // Create history record BEFORE deleting
                var taskHistory = new TasksHistory
                {
                    TaskId = task.Id,
                    ProjectId = task.ProjectId,
                    Title = task.Title,
                    Description = task.Description,
                    AssignedToUserId = task.AssignedToUserId,
                    Status = (int)task.Status,
                    DueDate = task.DueDate,
                    Action = "Deleted",
                    Reason = reason ?? "Task deleted"
                };

                await _TasksHistoryRepository.AddAsync(taskHistory);
                await _unitOfWork.SaveChangesAsync(); // Save history first

                await _taskRepository.HardDeleteAsync(task);

                await _unitOfWork.CommitAsync();
                return ApiResponse.SuccessResponse("Task deleted successfully");
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse.ErrorResponse($"Unable to delete task: {ex.Message}");
            }
        }


        // GET by ID (optional helper method)
        public async Task<ApiResponse<TaskDto>> GetTaskByIdAsync(int taskId)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(taskId);
                if (task == null || task.IsDeleted)
                    return ApiResponse<TaskDto>.ErrorResponse("Task not found");

                var taskDto = new TaskDto
                {
                    Id = task.Id,
                    ProjectId = task.ProjectId,
                    Title = task.Title,
                    Description = task.Description,
                    AssignedToUserId = task.AssignedToUserId,
                    DueDate = task.DueDate,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    ModifiedAt = task.ModifiedAt
                };

                return ApiResponse<TaskDto>.SuccessResponse(taskDto, "Task retrieved successfully");
            }
            catch (System.Exception ex)
            {
                return ApiResponse<TaskDto>.ErrorResponse($"Unable to retrieve task: {ex.Message}");
            }
        }


        // GET by Project (optional helper method)
        public async Task<ApiResponse<List<TaskDto>>> GetTasksByProjectAsync(int projectId)
        {
            try
            {
                var tasks = await _taskRepository.GetAllAsync();
                var projectTasks = tasks
                    .Where(t => t.ProjectId == projectId && !t.IsDeleted)
                    .Select(t => new TaskDto
                    {
                        Id = t.Id,
                        ProjectId = t.ProjectId,
                        Title = t.Title,
                        Description = t.Description,
                        AssignedToUserId = t.AssignedToUserId,
                        DueDate = t.DueDate,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt,
                        ModifiedAt = t.ModifiedAt
                    })
                    .ToList();

                return ApiResponse<List<TaskDto>>.SuccessResponse(
                    projectTasks,
                    $"Retrieved {projectTasks.Count} tasks"
                );
            }
            catch (System.Exception ex)
            {
                return ApiResponse<List<TaskDto>>.ErrorResponse(
                    $"Unable to retrieve tasks: {ex.Message}"
                );
            }
        }


        // UPDATE
        public async Task<ApiResponse> UpdateTaskAsync(UpdateTaskDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var task = await _taskRepository.GetByIdAsync(dto.TaskId);
                if (task == null || task.IsDeleted)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("Task not found");
                }

                // Track what fields are being updated
                var changes = new List<string>();
                               
                // Update Title if provided
                if (!string.IsNullOrWhiteSpace(dto.Title))
                {
                    task.Title = dto.Title.Trim();
                    changes.Add("Title");
                }

                // Update Description if provided (allow empty string to clear description)
                if (dto.Description != null)
                {
                    task.Description = dto.Description;
                    changes.Add("Description");
                }

                // Update AssignedToUserId if provided
                if (dto.AssignedToUserId.HasValue)
                {
                    // Use the task's current ProjectId (in case it wasn't updated)
                    var projectIdToCheck = dto.ProjectId ?? task.ProjectId;

                    var isAssigned = await _projectAssignmentQueryRepository
                        .IsUserAlreadyAssignedAsync(projectIdToCheck, dto.AssignedToUserId.Value);

                    if (!isAssigned)
                    {
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse.ErrorResponse(
                            "Assigned user does not belong to this project"
                        );
                    }

                    task.AssignedToUserId = dto.AssignedToUserId.Value;
                    changes.Add("Assignment");
                }

                // Update DueDate if provided
                if (dto.DueDate.HasValue)
                {
                    if (dto.DueDate.Value.Date < DateTime.UtcNow.Date)
                    {
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse.ErrorResponse(
                            "Due date cannot be in the past"
                        );
                    }

                    task.DueDate = dto.DueDate.Value;
                    changes.Add("Due Date");
                }

                // Update Status if provided
                if (dto.Status.HasValue)
                {
                    task.Status = dto.Status.Value;
                    changes.Add("Status");
                }

                // Check if any changes were made
                if (changes.Count == 0)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("No fields provided for update");
                }

                // Save task updates
                await _taskRepository.UpdateAsync(task);
                await _unitOfWork.SaveChangesAsync();

                // Create history record with updated action description
                var actionDescription = $"Updated: {string.Join(", ", changes)}";
                var taskHistory = new TasksHistory
                {
                    TaskId = task.Id,
                    ProjectId = task.ProjectId,
                    Title = task.Title,
                    Description = task.Description,
                    AssignedToUserId = task.AssignedToUserId,
                    Status = (int)task.Status,
                    DueDate = task.DueDate,
                    Action = actionDescription,
                    Reason = dto.Reason ?? "Task updated"
                };

                await _TasksHistoryRepository.AddAsync(taskHistory);

                await _unitOfWork.CommitAsync();
                return ApiResponse.SuccessResponse(
                    $"Task updated successfully. Changes: {string.Join(", ", changes)}"
                );
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse.ErrorResponse($"Unable to update task: {ex.Message}");
            }
        }
    }
}
