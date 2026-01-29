using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.TaskManager;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;


namespace ConstructionPM.Application.Services
{

    public class TaskService : ITaskService
    {

        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IProjectAssignmentQueryRepository _projectAssignmentQueryRepository;
        private readonly IGenericRepository<TaskItem> _taskRepository ;

        public TaskService(
            IGenericRepository<Project> projectRepository,
            IGenericRepository<User> userRepository,
            IProjectAssignmentQueryRepository projectAssignmentQueryRepository,
            IGenericRepository<TaskItem> taskRepository
            )
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _projectAssignmentQueryRepository = projectAssignmentQueryRepository;
            _taskRepository = taskRepository;
        }

        public async Task<ApiResponse<object>> CreateTaskAsync(CreateTaskDto dto, int currentUserId)
        {
            var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
            if (project == null || project.IsDeleted)
                return ApiResponse<object>.ErrorResponse("Project not found");

            var creator = await _userRepository.GetByIdAsync(currentUserId);
            if (creator == null || creator.IsDeleted || !creator.IsActive)
                return ApiResponse<object>.ErrorResponse("Invalid or inactive user");

            var creatorRole = await _projectAssignmentQueryRepository
                                    .GetUserRoleInProjectAsync(dto.ProjectId, currentUserId);

            if (creator.RoleId !=0)
            {
                if (creatorRole == null)
                {
                    return ApiResponse<object>.ErrorResponse(
                        "You are not assigned to this project"
                    );
                }

                if (creatorRole.RoleId != Role.ProjectManager)
                {
                    return ApiResponse<object>.ErrorResponse(
                        "You are not allowed to create tasks"
                    );
                }
            }


            var isAssigned = await _projectAssignmentQueryRepository
        .IsUserAlreadyAssignedAsync(dto.ProjectId, dto.AssignedToUserId);
            if (!isAssigned)
                return ApiResponse<object>.ErrorResponse(
                    "Assigned user does not belong to this project"
                );

            if (dto.DueDate.Date < DateTime.UtcNow.Date)
                return ApiResponse<object>.ErrorResponse(
                    "Due date cannot be in the past"
                );

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

            return ApiResponse<object>.SuccessResponse(
                "Task created successfully"
            );

        }
    }
}
