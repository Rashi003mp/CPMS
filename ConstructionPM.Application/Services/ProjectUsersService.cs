using ConstructionPM.Application.DTOs.AssignUser;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;


namespace ConstructionPM.Application.Services
{
    public class ProjectUsersService : IProjectUsersService
    {
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<ProjectUsers> _projectUsersRepository;
        private readonly IProjectAssignmentQueryRepository _projectAssignmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        private const int MaxProjectsPerUser = 5;



        public ProjectUsersService(
            IGenericRepository<Project> projectRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<ProjectUsers> projectUsersRepository,
            IProjectAssignmentQueryRepository projectAssignmentRepository,
            IUnitOfWork unitOfWork)
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _projectUsersRepository = projectUsersRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<object>> AssignUserToProjectAsync(int projectId, AssignProjectUserDto dto)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null || project.IsDeleted)
            {
                return ApiResponse<object>.ErrorResponse("Project not found");
            }

            var user = await _userRepository.GetByIdAsync(dto.AssignedUserId);
            if (user == null || user.IsDeleted)
            {
                return ApiResponse<object>.ErrorResponse("User not found");
            }

            if (!Enum.IsDefined(typeof(Role), dto.Role))
                return ApiResponse<object>.ErrorResponse("Invalid role specified");

            var currentProjectCount = await _projectAssignmentRepository.GetUserProjectCountAsync(dto.AssignedUserId);
            if (currentProjectCount >= MaxProjectsPerUser)
            {
                return ApiResponse<object>.ErrorResponse("User has reached the maximum number of assigned projects");
            }

            var alreadyAssigned = await _projectAssignmentRepository.IsUserAlreadyAssignedAsync(projectId, dto.AssignedUserId);
            if (alreadyAssigned)
            {
                return ApiResponse<object>.ErrorResponse("User is already assigned to this project");
            }

            if (await _projectAssignmentRepository
                        .IsRoleAlreadyAssignedInProjectAsync(projectId, dto.Role))
            {
                return ApiResponse<object>
                    .ErrorResponse("This role already exists in the project");
            }


            var assignment = new ProjectUsers
            {
                ProjectId = projectId,
                AssignedUserId = dto.AssignedUserId,
                AssignedUserName = dto.AssignedUserName,
                RoleId = dto.Role,
                Action = ProjectRoleActions.Assigned.ToString(),

            };

            await _projectUsersRepository.AddAsync(assignment);

            return ApiResponse<object>.SuccessResponse("User assigned to project successfully");





        }

        public async Task<ApiResponse> UnassignUserAsync(UnassignUserDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
                if (project == null )
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("Project not found");
                }

                var assignments = await _projectUsersRepository.GetAllAsync();

                var assignment = assignments.FirstOrDefault(pu =>
                    pu.ProjectId == dto.ProjectId &&
                    pu.AssignedUserId == dto.UserId &&
                    (int)pu.RoleId == dto.RoleId &&
                    !pu.IsDeleted
                );

                if (assignment == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("User assignment not found");
                }

                assignment.Action = ProjectRoleActions.Unassigned.ToString();
                assignment.Reason = dto.Reason;

                await _projectUsersRepository.DeleteAsync(assignment);

                await _unitOfWork.CommitAsync();
                return ApiResponse.SuccessResponse("User unassigned successfully");
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse.ErrorResponse("Unable to unassign user");
            }
        }
    }
}
