using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace ConstructionPM.Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ILogger<ProjectService> _logger;


        private readonly IProjectCommandRepository _projectRepository;
        private readonly IProjectQueryRepository _ProjectQueryRepository;
        private readonly IProjectStatusHistoryCommandRepository _historyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Project> _genericRepository;
        private readonly IGenericRepository<ProjectUsers> _ProjectUsersRepository;


        public ProjectService(
            IProjectCommandRepository projectRepository,
            IProjectStatusHistoryCommandRepository historyRepository,
            IUnitOfWork unitOfWork,
            IProjectQueryRepository ProjectQueryRepository,
            IGenericRepository<Project> GenericRepository,
            ILogger<ProjectService> logger,
            IGenericRepository<ProjectUsers> ProjectUsersRepository
            )
        {
            _projectRepository = projectRepository;
            _historyRepository = historyRepository;
            _unitOfWork = unitOfWork;
            _ProjectQueryRepository = ProjectQueryRepository;
            _genericRepository = GenericRepository;
            _logger = logger;
            _ProjectUsersRepository = ProjectUsersRepository;
        }

        public async Task<int> CreateAsync(CreateProjectDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var project = new Project
                {
                    ProjectName = dto.ProjectName,
                    Description = dto.Description,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Status = dto.Status
                };

                await _projectRepository.AddAsync(project);
                await _unitOfWork.SaveChangesAsync(); // ID generated here

                var history = new ProjectStatusHistory
                {
                    ProjectId = project.Id,
                    Status = dto.Status,
                };

                await _historyRepository.AddAsync(history);
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitAsync();

                return project.Id;
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public async Task<ApiResponse<object>> DeleteProjectAsync(int projectId, string Reason)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var project = await _genericRepository.GetByIdAsync(projectId);
                if (project == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("Project not found");
                }

                var projectUsers = await _ProjectUsersRepository.GetAllAsync();

                Console.WriteLine("Project Users Count: " + projectUsers);
                if (projectUsers == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("No users associated with the project");
                }

                var associatedUsers = projectUsers.Where(
                    pu =>
                    pu.ProjectId == projectId)
                    .ToList();

                foreach (var users in associatedUsers)
                {
                    users.Action = ProjectRoleActions.Removed.ToString();
                    users.Reason = Reason;

                }

                project.Status = ProjectStatus.Deleted;

                await _genericRepository.DeleteAsync(project);

                var history = new ProjectStatusHistory
                {
                    ProjectId = project.Id,
                    Status = ProjectStatus.Deleted,
                    Remarks = Reason,
                };
                await _historyRepository.AddAsync(history);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitAsync();
                return ApiResponse<object>.SuccessResponse("Project deleted successfully");
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse<object>.ErrorResponse("Unable to delete project");
            }

        }

        public async Task<ApiResponse<PaginatedResult<ProjectDto>>> GetAllAsync
            (
            int page,
            int pageSize,
            string? search,
            ProjectStatus? status
            )
        {
            try
            {
                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);

                var projects = await _ProjectQueryRepository.GetAllAsync();

                if (!string.IsNullOrWhiteSpace(search))
                    projects = projects.Where(p =>
                        p.ProjectName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (!string.IsNullOrEmpty(p.Description) &&
                         p.Description.Contains(search, StringComparison.OrdinalIgnoreCase)))
                        .ToList();

                if (status.HasValue)
                    projects = projects.Where(p => p.Status == status.Value).ToList();

                var totalCount = projects.Count;

                var paginated = projects
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProjectDto
                    {
                        Id = p.Id,
                        Name = p.ProjectName,
                        Description = p.Description,
                        Status = p.Status.ToString(),
                        CreatedAt = p.CreatedAt,
                        CreatedByUserName = p.CreatedByUserName
                    })
                    .ToList();

                return ApiResponse<PaginatedResult<ProjectDto>>.SuccessResponse(
                    new PaginatedResult<ProjectDto>
                    {
                        Items = paginated,
                        TotalCount = totalCount,
                        Page = page,
                        PageSize = pageSize
                    });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error while fetching projects");

                return ApiResponse<PaginatedResult<ProjectDto>>.ErrorResponse(
                    "An unexpected error occurred while fetching projects.");
            }
        }


        public async Task<ApiResponse<ProjectDto>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return ApiResponse<ProjectDto>.ErrorResponse("Invalid project ID");

            try
            {
                var project = await _genericRepository.GetByIdAsync(id);

                if (project == null)
                    return ApiResponse<ProjectDto>.ErrorResponse($"Project with ID {id} not found");

                return ApiResponse<ProjectDto>.SuccessResponse(new ProjectDto
                {
                    Id = project.Id,
                    Name = project.ProjectName,
                    Description = project.Description,
                    Status = project.Status.ToString(),
                    CreatedAt = project.CreatedAt,
                    CreatedByUserName = project.CreatedByUserName
                });
            }
            catch (System.Exception)
            {
                return ApiResponse<ProjectDto>.ErrorResponse("An error occurred while retrieving the project");
            }
        }


        public async Task<ApiResponse<object>> UpdateProjectAsync(
        int projectId,
        UpdateProjectDto dto
        )
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var project = await _genericRepository.GetByIdAsync(projectId);
                if (project == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("Project not found");
                }
                if (!IsValidStatusTransition(project.Status, dto.Status))
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse(
                        $"Invalid status transition from '{project.Status}' to '{dto.Status}'. " +
                        $"Status cannot revert from advanced states.");
                }

                var oldStatus = (ProjectStatus)project.Status;
                var newStaus = dto.Status;

                project.ProjectName = dto.ProjectName;
                project.Description = dto.Description;
                project.StartDate = dto.StartDate;
                project.EndDate = dto.EndDate;
                project.Status = newStaus;

                await _genericRepository.UpdateAsync(project);

                if (oldStatus != newStaus)
                {
                    var history = new ProjectStatusHistory
                    {
                        ProjectId = project.Id,
                        Status = newStaus,
                        Remarks = dto.Remarks,
                    };
                    await _historyRepository.AddAsync(history);
                }
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitAsync();

                return ApiResponse<object>.SuccessResponse("Project updated successfully");
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse<object>.ErrorResponse("Unable to update project");

            }
        }
        private bool IsValidStatusTransition(ProjectStatus currentStatus, ProjectStatus newStatus)
        {


            return currentStatus switch
            {
                ProjectStatus.Planned => true,
                ProjectStatus.Active when newStatus == ProjectStatus.OnHold => true,
                ProjectStatus.Active when newStatus == ProjectStatus.Completed => true,
                ProjectStatus.Completed => false,
                ProjectStatus.Deleted => false,
                _ => false
            };
        }

    }

}

