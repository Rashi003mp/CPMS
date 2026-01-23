using ConstructionPM.Application.DTOs;
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

namespace ConstructionPM.Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectCommandRepository _projectRepository;
        private readonly IProjectQueryRepository _ProjectQueryRepository;
        private readonly IProjectStatusHistoryCommandRepository _historyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Project> _genericRepository;

        public ProjectService(
            IProjectCommandRepository projectRepository,
            IProjectStatusHistoryCommandRepository historyRepository,
            IUnitOfWork unitOfWork,
            IProjectQueryRepository ProjectQueryRepository,
            IGenericRepository<Project> GenericRepository
            )
        {
            _projectRepository = projectRepository;
            _historyRepository = historyRepository;
            _unitOfWork = unitOfWork;
            _ProjectQueryRepository = ProjectQueryRepository;
            _genericRepository = GenericRepository;
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

        public Task<IEnumerable<Project>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse<PaginatedResult<ProjectDto>>> GetAllAsync(int page, int pageSize, string? search, ProjectStatus? status)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);


            var projects = await _ProjectQueryRepository.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(search))
                projects = projects.Where(p => p.ProjectName.Contains(search, StringComparison.OrdinalIgnoreCase)
                    || (p.Description != null && p.Description.Contains(search, StringComparison.OrdinalIgnoreCase)))
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
                }).ToList();
                
            return ApiResponse<PaginatedResult<ProjectDto>>.SuccessResponse(
                new PaginatedResult<ProjectDto>
                {
                    Items = paginated,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
        }

        public Task<Project> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
