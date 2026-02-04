using ConstructionPM.Application.DTOs.AssignUser;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using ConstructionPM.Application.Interfaces.Factories;


namespace ConstructionPM.Application.Services
{
    public class ProjectUsersService : IProjectUsersService
    {
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<ProjectUsers> _projectUsersRepository;
        private readonly IGenericRepository<ProjectUsersHistory> _projectUsersHistoryRepository;
        private readonly IProjectAssignmentQueryRepository _projectAssignmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProjectUsersHistoryFactory _projectUsersHistoryFactory;

        private const int MaxProjectsPerUser = 5;



        public ProjectUsersService(
            IGenericRepository<Project> projectRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<ProjectUsers> projectUsersRepository,
            IProjectAssignmentQueryRepository projectAssignmentRepository,
            IUnitOfWork unitOfWork,
            IProjectUsersHistoryFactory projectUsersHistoryFactory,
            IGenericRepository<ProjectUsersHistory> genericRepository
            )
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _projectUsersRepository = projectUsersRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
            _unitOfWork = unitOfWork;
            _projectAssignmentRepository = projectAssignmentRepository;
            _projectUsersHistoryFactory = projectUsersHistoryFactory;
            _projectUsersHistoryRepository = genericRepository;
        }


        //public async Task<ApiResponse> UnassignUserAsync(UnassignUserDto dto)
        //{
        //    await _unitOfWork.BeginTransactionAsync();

        //    try
        //    {
        //        var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
        //        if (project == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("Project not found");
        //        }

        //        var assignments = await _projectUsersRepository.GetAllAsync();

        //        var assignment = assignments.FirstOrDefault(pu =>
        //            pu.ProjectId == dto.ProjectId &&
        //            pu.AssignedUserId == dto.UserId &&
        //            (int)pu.RoleId == dto.RoleId &&
        //            !pu.IsDeleted
        //        );

        //        if (assignment == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("User assignment not found");
        //        }

        //        assignment.Action = ProjectRoleActions.Unassigned.ToString();
        //        assignment.Reason = dto.Reason;

        //        await _projectUsersRepository.DeleteAsync(assignment);

        //        await _unitOfWork.CommitAsync();
        //        return ApiResponse.SuccessResponse("User unassigned successfully");
        //    }
        //    catch
        //    {
        //        await _unitOfWork.RollbackAsync();
        //        return ApiResponse.ErrorResponse("Unable to unassign user");
        //    }
        //}
        //public async Task<ApiResponse> UnassignUserAsync(UnassignUserDto dto)
        //{
        //    await _unitOfWork.BeginTransactionAsync();
        //    try
        //    {
        //        var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
        //        if (project == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("Project not found");
        //        }

        //        var assignments = await _projectUsersRepository.GetAllAsync();
        //        var assignment = assignments.FirstOrDefault(pu =>
        //            pu.ProjectId == dto.ProjectId &&
        //            pu.AssignedUserId == dto.UserId &&
        //            (int)pu.RoleId == dto.RoleId &&
        //            !pu.IsDeleted
        //        );

        //        if (assignment == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("User assignment not found");
        //        }
        //        var projectUserId = assignment.Id;
        //        // Update action and reason
        //        assignment.Action = ProjectRoleActions.Unassigned.ToString();
        //        assignment.Reason = dto.Reason;

        //        await _unitOfWork.SaveChangesAsync();
        //        // Create history record
        //        var historyRecord = new ProjectUsersHistory
        //        {
        //            ProjectUserId = assignment.Id,
        //            ProjectId = assignment.ProjectId,
        //            RoleId =(int)assignment.RoleId,
        //            AssignedUserId = assignment.AssignedUserId,
        //            AssignedUserName = assignment.AssignedUserName,
        //            Action = assignment.Action,
        //            Reason = assignment.Reason
        //            // Audit fields will be set automatically by ApplyAuditInfo
        //        };

        //        // Hard delete from ProjectUsers table
        //        await _projectUsersRepository.HardDeleteAsync(assignment);

        //        await _projectUsersHistoryRepository.AddAsync(historyRecord);


        //        await _unitOfWork.CommitAsync();
        //        return ApiResponse.SuccessResponse("User unassigned successfully");
        //    }
        //    catch
        //    {
        //        await _unitOfWork.RollbackAsync();
        //        return ApiResponse.ErrorResponse("Unable to unassign user");
        //    }
        //}

        public async Task<ApiResponse> UnassignUserAsync(UnassignUserDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
                if (project == null)
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

                // Capture ALL data before deleting
                var historyRecord = new ProjectUsersHistory
                {
                    ProjectUserId = assignment.Id,  // Store the ID value
                    ProjectId = assignment.ProjectId,
                    RoleId = (int)assignment.RoleId,
                    AssignedUserId = assignment.AssignedUserId,
                    AssignedUserName = assignment.AssignedUserName,
                    Action = ProjectRoleActions.Unassigned.ToString(),
                    Reason = dto.Reason
                };

                // Add history record FIRST
                await _projectUsersHistoryRepository.AddAsync(historyRecord);
                await _unitOfWork.SaveChangesAsync(); // Save the history first

                // Then hard delete
                await _projectUsersRepository.HardDeleteAsync(assignment);

                await _unitOfWork.CommitAsync();
                return ApiResponse.SuccessResponse("User unassigned successfully");
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse.ErrorResponse($"Unable to unassign user: {ex.Message}");
            }
        }


        //public async Task<ApiResponse> ReplaceUserAsync(ReplaceUserDto dto)
        //{
        //    await _unitOfWork.BeginTransactionAsync();

        //    try
        //    {
        //        var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
        //        if (project == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("Project not found");
        //        }

        //        var newUser = await _userRepository.GetByIdAsync(dto.NewUserId);
        //        if (newUser == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("New user not found");
        //        }

        //        var assignments = await _projectUsersRepository.GetAllAsync();

        //        var oldAssignment = assignments.FirstOrDefault(pu =>
        //            pu.ProjectId == dto.ProjectId &&
        //            pu.AssignedUserId == dto.OldUserId &&
        //            (int)pu.RoleId == dto.RoleId &&
        //            !pu.IsDeleted
        //        );

        //        if (oldAssignment == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("Old user assignment not found");
        //        }

        //        var duplicate = assignments.Any(pu =>
        //            pu.ProjectId == dto.ProjectId &&
        //            pu.AssignedUserId == dto.NewUserId &&
        //            (int)pu.RoleId == dto.RoleId &&
        //            !pu.IsDeleted
        //        );

        //        if (duplicate)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse.ErrorResponse("New user already assigned to this role");
        //        }

        //        oldAssignment.Action = ProjectRoleActions.Replaced.ToString();
        //        oldAssignment.Reason = dto.Reason;

        //        await _projectUsersRepository.DeleteAsync(oldAssignment);

        //        var newAssignment = new ProjectUsers
        //        {
        //            ProjectId = dto.ProjectId,
        //            AssignedUserId = dto.NewUserId,
        //            AssignedUserName = newUser.Name,
        //            RoleId = (Role)dto.RoleId,
        //            Action = ProjectRoleActions.Assigned.ToString(),
        //            Reason = "Replacement"
        //        };

        //        await _projectUsersRepository.AddAsync(newAssignment);

        //        await _unitOfWork.CommitAsync();
        //        return ApiResponse.SuccessResponse("User replaced successfully");
        //    }
        //    catch
        //    {
        //        await _unitOfWork.RollbackAsync();
        //        return ApiResponse.ErrorResponse("Unable to replace user");
        //    }
        //}


        public async Task<ApiResponse> ReplaceUserAsync(ReplaceUserDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
                if (project == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("Project not found");
                }

                var newUser = await _userRepository.GetByIdAsync(dto.NewUserId);
                if (newUser == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("New user not found");
                }

                var assignments = await _projectUsersRepository.GetAllAsync();
                var oldAssignment = assignments.FirstOrDefault(pu =>
                    pu.ProjectId == dto.ProjectId &&
                    pu.AssignedUserId == dto.OldUserId &&
                    (int)pu.RoleId == dto.RoleId &&
                    !pu.IsDeleted
                );

                if (oldAssignment == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("Old user assignment not found");
                }

                var duplicate = assignments.Any(pu =>
                    pu.ProjectId == dto.ProjectId &&
                    pu.AssignedUserId == dto.NewUserId &&
                    (int)pu.RoleId == dto.RoleId &&
                    !pu.IsDeleted
                );

                if (duplicate)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse.ErrorResponse("New user already assigned to this role");
                }

                // ============================================
                // Step 1: Create history for OLD user (Replaced)
                // ============================================
                var oldUserHistory = new ProjectUsersHistory
                {
                    ProjectUserId = oldAssignment.Id,
                    ProjectId = oldAssignment.ProjectId,
                    RoleId = (int)oldAssignment.RoleId,
                    AssignedUserId = oldAssignment.AssignedUserId,
                    AssignedUserName = oldAssignment.AssignedUserName,
                    Action = ProjectRoleActions.Replaced.ToString(),
                    Reason = dto.Reason
                };

                await _projectUsersHistoryRepository.AddAsync(oldUserHistory);
                await _unitOfWork.SaveChangesAsync(); // Save history first

                // ============================================
                // Step 2: Hard delete old assignment
                // ============================================
                await _projectUsersRepository.HardDeleteAsync(oldAssignment);

                // ============================================
                // Step 3: Create NEW assignment
                // ============================================
                var newAssignment = new ProjectUsers
                {
                    ProjectId = dto.ProjectId,
                    AssignedUserId = dto.NewUserId,
                    AssignedUserName = newUser.Name,
                    RoleId = (Role)dto.RoleId,
                    Action = ProjectRoleActions.Assigned.ToString(),
                    Reason = "Replacement for user ID: " + dto.OldUserId
                };

                await _projectUsersRepository.AddAsync(newAssignment);
                await _unitOfWork.SaveChangesAsync(); // Save new assignment

                // ============================================
                // Step 4: Create history for NEW user (Assigned via Replacement)
                // ============================================
                var newUserHistory = new ProjectUsersHistory
                {
                    ProjectUserId = newAssignment.Id, // Reference to the newly created assignment
                    ProjectId = newAssignment.ProjectId,
                    RoleId = (int)newAssignment.RoleId,
                    AssignedUserId = newAssignment.AssignedUserId,
                    AssignedUserName = newAssignment.AssignedUserName,
                    Action = ProjectRoleActions.Assigned.ToString(),
                    Reason = "Replaced user ID: " + dto.OldUserId
                };

                await _projectUsersHistoryRepository.AddAsync(newUserHistory);

                await _unitOfWork.CommitAsync();
                return ApiResponse.SuccessResponse("User replaced successfully");
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse.ErrorResponse($"Unable to replace user: {ex.Message}");
            }
        }
        public async Task<ApiResponse<object>> AssignUserToProjectAsync(
                    int projectId,
                    AssignProjectUserDto dto
            )
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var isUserActive = await _userRepository.IsActiveAsync(dto.AssignedUserId);
                if (!isUserActive)
                    return ApiResponse<object>.ErrorResponse("User is inactive");

                var project = await _projectRepository.GetByIdAsync(projectId);
                if (project == null || project.IsDeleted)
                    return ApiResponse<object>.ErrorResponse("Project not found");

                var user = await _userRepository.GetByIdAsync(dto.AssignedUserId);
                if (user == null || user.IsDeleted)
                    return ApiResponse<object>.ErrorResponse("User not found");

                if (!Enum.IsDefined(typeof(Role), dto.Role))
                    return ApiResponse<object>.ErrorResponse("Invalid role specified");

                if (user.RoleId == Role.Client && dto.Role != Role.Client)
                    return ApiResponse<object>
                        .ErrorResponse("Client users can only be assigned the Client role");

                var currentProjectCount =
                    await _projectAssignmentRepository
                        .GetUserProjectCountAsync(dto.AssignedUserId);

                if (currentProjectCount >= MaxProjectsPerUser)
                    return ApiResponse<object>
                        .ErrorResponse("User has reached the maximum number of assigned projects");

                var alreadyAssigned =
                    await _projectAssignmentRepository
                        .IsUserAlreadyAssignedAsync(projectId, dto.AssignedUserId);

                if (alreadyAssigned)
                    return ApiResponse<object>
                        .ErrorResponse("User is already assigned to this project");

                if (await _projectAssignmentRepository
                        .IsRoleAlreadyAssignedInProjectAsync(projectId, dto.Role))
                {
                    return ApiResponse<object>
                        .ErrorResponse("This role already exists in the project");
                }

                // ================= MAIN ASSIGNMENT =================

                var assignment = new ProjectUsers
                {
                    ProjectId = projectId,
                    AssignedUserId = dto.AssignedUserId,
                    AssignedUserName = dto.AssignedUserName,
                    RoleId = dto.Role,
                    Action = ProjectRoleActions.Assigned.ToString(),
                    IsDeleted = false
                };

                await _projectUsersRepository.AddAsync(assignment);
                await _unitOfWork.SaveChangesAsync(); // 🔑 ID GENERATED HERE

                var history = _projectUsersHistoryFactory.Create(
                    assignment,
                    ProjectRoleActions.Assigned.ToString());

                await _projectUsersHistoryRepository.AddAsync(history);

                // ================= AUTO PM ASSIGNMENT =================

                if (dto.Role == Role.SiteEngineer)
                {
                    var hasProjectManager =
                        await _projectAssignmentRepository
                            .IsRoleAlreadyAssignedInProjectAsync(
                                projectId,
                                Role.ProjectManager);

                    if (!hasProjectManager)
                    {
                        var pmAssignment = new ProjectUsers
                        {
                            ProjectId = projectId,
                            AssignedUserId = dto.AssignedUserId,
                            AssignedUserName = dto.AssignedUserName,
                            RoleId = Role.ProjectManager,
                            Action = ProjectRoleActions.Assigned.ToString(),
                            IsDeleted = false
                        };

                        await _projectUsersRepository.AddAsync(pmAssignment);
                        await _unitOfWork.SaveChangesAsync(); // 🔑 ID GENERATED

                        var pmHistory = _projectUsersHistoryFactory.Create(
                            pmAssignment,
                            ProjectRoleActions.Assigned.ToString(),
                            "Auto-assigned Project Manager role");

                        await _projectUsersHistoryRepository.AddAsync(pmHistory);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitAsync();

                return ApiResponse<object>
                    .SuccessResponse("User assigned to project successfully");
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

    }
}
