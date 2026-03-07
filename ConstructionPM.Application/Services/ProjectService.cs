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
        private readonly IProjectQueryRepository _projectQueryRepository;
        private readonly IProjectQueryRepository _ProjectQueryRepository;
        private readonly IProjectStatusHistoryCommandRepository _historyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Project> _genericRepository;
        private readonly IGenericRepository<ProjectUsers> _ProjectUsersRepository;
        private readonly IProjectAssignmentQueryRepository _projectAssignmentQueryRepository;
        private readonly IImageUploadService _imageUploadService;

        public ProjectService(
            IProjectCommandRepository projectRepository,
            IProjectStatusHistoryCommandRepository historyRepository,
            IUnitOfWork unitOfWork,
            IProjectQueryRepository ProjectQueryRepository,
            IGenericRepository<Project> GenericRepository,
            ILogger<ProjectService> logger,
            IGenericRepository<ProjectUsers> ProjectUsersRepository,
            IProjectQueryRepository projectQueryRepository,
            IProjectAssignmentQueryRepository projectAssignmentQuery,
            IImageUploadService imageUploadService
            )
        {
            _projectRepository = projectRepository;
            _historyRepository = historyRepository;
            _unitOfWork = unitOfWork;
            _ProjectQueryRepository = ProjectQueryRepository;
            _genericRepository = GenericRepository;
            _logger = logger;
            _ProjectUsersRepository = ProjectUsersRepository;
            _projectQueryRepository = ProjectQueryRepository;
            _projectAssignmentQueryRepository = projectAssignmentQuery;
            _imageUploadService = imageUploadService;
        }

        public async Task<ApiResponse<int>> CreateAsync(CreateProjectDto dto)
        {
            var isNameExists = await _projectQueryRepository
                .IsProjectNameExistsAsync(dto.ProjectName);

            if (isNameExists)
                return ApiResponse<int>.ErrorResponse("Project name already exists.", 400);

            if (dto.StartDate.Date < DateTime.UtcNow.Date)
                return ApiResponse<int>.ErrorResponse("Start date cannot be in the past.", 400);

            if (dto.EndDate.HasValue && dto.EndDate < dto.StartDate)
                return ApiResponse<int>.ErrorResponse("End date cannot be earlier than start date.", 400);

            if (dto.Status == ProjectStatus.Completed)
                return ApiResponse<int>.ErrorResponse("Project cannot be created with Completed status.", 400);

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                string? imageUrl = null;
                string? imagePublicId = null;

                // Upload image if provided
                if (dto.Image != null)
                {
                    try
                    {
                        var uploadResult = await _imageUploadService.UploadImageAsync(dto.Image);
                        imageUrl = uploadResult.Url;
                        imagePublicId = uploadResult.PublicId;
                    }
                    catch (System.Exception ex)
                    {
                        _logger.LogError(ex, "Failed to upload project image");
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse<int>.ErrorResponse("Failed to upload project image", 500);
                    }
                }

                var project = new Project
                {
                    ProjectName = dto.ProjectName,
                    Description = dto.Description,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Status = dto.Status,
                    ImageUrl = imageUrl,
                    ImagePublicId = imagePublicId
                };

                await _projectRepository.AddAsync(project);
                await _unitOfWork.SaveChangesAsync();

                var history = new ProjectStatusHistory
                {
                    ProjectId = project.Id,
                    Status = dto.Status,
                };

                await _historyRepository.AddAsync(history);
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitAsync();

                return ApiResponse<int>.SuccessResponse(
                    project.Id,
                    "Project created successfully",
                    201
                );
            }
            catch (System.Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                _logger.LogError(ex, "Failed to create project");
                return ApiResponse<int>.ErrorResponse(
                    "Failed to create project",
                    500
                );
            }
        }


        public async Task<ApiResponse<object>> DeleteProjectAsync(int projectId, string Reason)
        {
            if (projectId <=0 )
                return ApiResponse<object>.ErrorResponse("Invalid project ID");
            if (string.IsNullOrWhiteSpace(Reason))
                return ApiResponse<object>.ErrorResponse("Reason for deletion is required");

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var project = await _genericRepository.GetByIdAsync(projectId);
                if (project == null)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse("Project not found");
                }

                // Delete image from Cloudinary if exists
                if (!string.IsNullOrEmpty(project.ImagePublicId))
                {
                    try
                    {
                        await _imageUploadService.DeleteImageAsync(project.ImagePublicId);
                    }
                    catch (System.Exception ex)
                    {
                        _logger.LogError(ex, "Failed to delete image from Cloudinary for project {ProjectId}", projectId);
                        // Continue with project deletion even if image deletion fails
                    }
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
                        CreatedByUserName = p.CreatedByUserName,
                        ImageUrl = p.ImageUrl
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


        //public async Task<ApiResponse<ProjectDto>> GetByIdAsync(int id)
        //{
        //    if (id <= 0)
        //        return ApiResponse<ProjectDto>.ErrorResponse("Invalid project ID");

        //    try
        //    {
        //        var project = await _genericRepository.GetByIdAsync(id);

        //        if (project == null)
        //            return ApiResponse<ProjectDto>.ErrorResponse($"Project with ID {id} not found");

        //        return ApiResponse<ProjectDto>.SuccessResponse(new ProjectDto
        //        {
        //            Id = project.Id,
        //            Name = project.ProjectName,
        //            Description = project.Description,
        //            Status = project.Status.ToString(),
        //            CreatedAt = project.CreatedAt,
        //            CreatedByUserName = project.CreatedByUserName
        //        });
        //    }
        //    catch (System.Exception)
        //    {
        //        return ApiResponse<ProjectDto>.ErrorResponse("An error occurred while retrieving the project");
        //    }
        //}



        //public async Task<ApiResponse<object>> UpdateProjectAsync(
        //int projectId,
        //UpdateProjectDto dto
        //)
        //{
        //    await _unitOfWork.BeginTransactionAsync();

        //    try
        //    {
        //        var project = await _genericRepository.GetByIdAsync(projectId);
        //        if (project == null)
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse<object>.ErrorResponse("Project not found");
        //        }
        //        if (!IsValidStatusTransition(project.Status, dto.Status))
        //        {
        //            await _unitOfWork.RollbackAsync();
        //            return ApiResponse<object>.ErrorResponse(
        //                $"Invalid status transition from '{project.Status}' to '{dto.Status}'. " +
        //                $"Status cannot revert from advanced states.");
        //        }

        //        var oldStatus = (ProjectStatus)project.Status;
        //        var newStaus = dto.Status;

        //        project.ProjectName = dto.ProjectName;
        //        project.Description = dto.Description;
        //        project.StartDate = dto.StartDate;
        //        project.EndDate = dto.EndDate;
        //        project.Status = newStaus;

        //        await _genericRepository.UpdateAsync(project);

        //        if (oldStatus != newStaus)
        //        {
        //            var history = new ProjectStatusHistory
        //            {
        //                ProjectId = project.Id,
        //                Status = newStaus,
        //                Remarks = dto.Remarks,
        //            };
        //            await _historyRepository.AddAsync(history);
        //        }
        //        await _unitOfWork.SaveChangesAsync();
        //        await _unitOfWork.CommitAsync();

        //        return ApiResponse<object>.SuccessResponse("Project updated successfully");
        //    }
        //    catch
        //    {
        //        await _unitOfWork.RollbackAsync();
        //        return ApiResponse<object>.ErrorResponse("Unable to update project");

        //    }
        //}

        //public async Task<ApiResponse<ProjectDto>> GetByIdAsync(int projectId, int userId)
        //{
        //    if (projectId <= 0 || userId <= 0)
        //        return ApiResponse<ProjectDto>.ErrorResponse("Invalid project or user ID");

        //    try
        //    {
        //        // 2. Verify user assigned to project (YOUR EXISTING METHOD!)
        //        var projectUser = await _projectAssignmentQueryRepository.GetUserRoleInProjectAsync(projectId, userId);
        //        if (projectUser == null)
        //            return ApiResponse<ProjectDto>.ErrorResponse($"Project {projectId} not accessible to this client",403);

        //        // 3. Get project and map to DTO
        //        var project = await _genericRepository.GetByIdAsync(projectId);
        //        if (project == null)
        //            return ApiResponse<ProjectDto>.ErrorResponse($"Project with ID {projectId} not found");

        //        return ApiResponse<ProjectDto>.SuccessResponse(new ProjectDto
        //        {
        //            Id = project.Id,
        //            Name = project.ProjectName,
        //            Description = project.Description,
        //            Status = project.Status.ToString(),
        //            CreatedAt = project.CreatedAt,
        //            CreatedByUserName = project.CreatedByUserName
        //        });
        //    }
        //    catch (System.Exception)
        //    {
        //        return ApiResponse<ProjectDto>.ErrorResponse("An error occurred while retrieving the project",200);
        //    }
        //}

        public async Task<ApiResponse<ProjectDto>> GetByIdAsync(
    int projectId,
    int userId,
    string role)
        {
            if (projectId <= 0 || userId <= 0)
                return ApiResponse<ProjectDto>
                    .ErrorResponse("Invalid project or user ID", 400);

            try
            {
                // 🔐 Admin bypasses assignment check
                if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    var projectUser =
                        await _projectAssignmentQueryRepository
                            .GetUserRoleInProjectAsync(projectId, userId);

                    if (projectUser == null)
                        return ApiResponse<ProjectDto>
                            .ErrorResponse("You are not assigned to this project", 403);
                }

                var project = await _projectQueryRepository
                                .GetByIdDashboardAsync(projectId);


                if (project == null)
                    return ApiResponse<ProjectDto>
                        .ErrorResponse($"Project with ID {projectId} not found", 404);

                return ApiResponse<ProjectDto>
                            .SuccessResponse(project);

                //return ApiResponse<ProjectDto>.SuccessResponse(new ProjectDto
                //{
                //    Id = project.Id,
                //    Name = project.ProjectManagerName,
                //    Description = project.Description,
                //    Status = project.Status.ToString(),
                //    CreatedAt = project.CreatedAt,
                //    CreatedByUserName = project.CreatedByUserName,
                //    ProjectManagerName = project.ProjectManagerName,
                //    SiteEngineerName = project.SiteEngineerName
                //});
            }
            catch
            {
                return ApiResponse<ProjectDto>
                    .ErrorResponse("An error occurred while retrieving the project", 500);
            }
        }

        public async Task<ApiResponse<object>> UpdateProjectAsync(
    int projectId,
    UpdateProjectDto dto)
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

                var oldStatus = project.Status;

                if (dto.Status.HasValue &&
                    !IsValidStatusTransition(project.Status, dto.Status.Value))
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse(
                        $"Invalid status transition from '{project.Status}' to '{dto.Status}'.");
                }

                // Date validation (only if provided)
                var effectiveStartDate = dto.StartDate ?? project.StartDate;
                var effectiveEndDate = dto.EndDate ?? project.EndDate;

                if (effectiveEndDate.HasValue &&
                    effectiveEndDate < effectiveStartDate)
                {
                    await _unitOfWork.RollbackAsync();
                    return ApiResponse<object>.ErrorResponse(
                        "End date cannot be earlier than start date.");
                }

                // ---------------- IMAGE HANDLING ----------------

                // Handle image removal
                if (dto.RemoveImage && !string.IsNullOrEmpty(project.ImagePublicId))
                {
                    try
                    {
                        await _imageUploadService.DeleteImageAsync(project.ImagePublicId);
                        project.ImageUrl = null;
                        project.ImagePublicId = null;
                    }
                    catch (System.Exception ex)
                    {
                        _logger.LogError(ex, "Failed to delete image from Cloudinary");
                        // Continue with update even if image deletion fails
                    }
                }

                // Handle new image upload
                if (dto.Image != null)
                {
                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(project.ImagePublicId))
                    {
                        try
                        {
                            await _imageUploadService.DeleteImageAsync(project.ImagePublicId);
                        }
                        catch (System.Exception ex)
                        {
                            _logger.LogError(ex, "Failed to delete old image from Cloudinary");
                            // Continue with new upload
                        }
                    }

                    // Upload new image
                    try
                    {
                        var uploadResult = await _imageUploadService.UploadImageAsync(dto.Image);
                        project.ImageUrl = uploadResult.Url;
                        project.ImagePublicId = uploadResult.PublicId;
                    }
                    catch (System.Exception ex)
                    {
                        _logger.LogError(ex, "Failed to upload new project image");
                        await _unitOfWork.RollbackAsync();
                        return ApiResponse<object>.ErrorResponse("Failed to upload new project image", 500);
                    }
                }

                // ---------------- SELECTIVE UPDATES ----------------

                if (!string.IsNullOrWhiteSpace(dto.ProjectName))
                    project.ProjectName = dto.ProjectName.Trim();

                if (!string.IsNullOrWhiteSpace(dto.Description))
                    project.Description = dto.Description.Trim();

                if (dto.StartDate.HasValue)
                    project.StartDate = dto.StartDate.Value;

                if (dto.EndDate.HasValue)
                    project.EndDate = dto.EndDate;

                if (dto.Status.HasValue)
                    project.Status = dto.Status.Value;

                await _genericRepository.UpdateAsync(project);

                // ---------------- STATUS HISTORY ----------------

                if (dto.Status.HasValue && oldStatus != dto.Status.Value)
                {
                    var history = new ProjectStatusHistory
                    {
                        ProjectId = project.Id,
                        Status = dto.Status.Value,
                        Remarks = dto.Remarks
                    };

                    await _historyRepository.AddAsync(history);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitAsync();

                return ApiResponse<object>.SuccessResponse(
                    "Project updated successfully");
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse<object>.ErrorResponse(
                    "Unable to update project");
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

        public async Task<ApiResponse<PaginatedResult<ProjectDto>>> GetProjectsByUserIdAsync(
            int userId,
            int page,
            int pageSize,
            string? search,
            ProjectStatus? status)
        {
            try
            {
                if (userId <= 0)
                    return ApiResponse<PaginatedResult<ProjectDto>>.ErrorResponse("Invalid user ID", 400);

                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);

                // Get project IDs assigned to the user
                var projectIds = await _projectAssignmentQueryRepository.GetProjectIdsByUserIdAsync(userId);

                if (!projectIds.Any())
                {
                    return ApiResponse<PaginatedResult<ProjectDto>>.SuccessResponse(
                        new PaginatedResult<ProjectDto>
                        {
                            Items = new List<ProjectDto>(),
                            TotalCount = 0,
                            Page = page,
                            PageSize = pageSize
                        });
                }

                // Get all projects for those IDs
                var allProjects = await _ProjectQueryRepository.GetAllAsync();
                var projects = allProjects.Where(p => projectIds.Contains(p.Id)).ToList();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(search))
                    projects = projects.Where(p =>
                        p.ProjectName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (!string.IsNullOrEmpty(p.Description) &&
                         p.Description.Contains(search, StringComparison.OrdinalIgnoreCase)))
                        .ToList();

                // Apply status filter
                if (status.HasValue)
                    projects = projects.Where(p => p.Status == status.Value).ToList();

                var totalCount = projects.Count;

                // Paginate
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
                        CreatedByUserName = p.CreatedByUserName,
                        ImageUrl = p.ImageUrl
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
                _logger.LogError(ex, "Error while fetching projects for user {UserId}", userId);

                return ApiResponse<PaginatedResult<ProjectDto>>.ErrorResponse(
                    "An unexpected error occurred while fetching projects.");
            }
        }

    }

}

