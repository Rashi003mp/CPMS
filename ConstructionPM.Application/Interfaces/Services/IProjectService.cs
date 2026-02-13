using ConstructionPM.Application.DTOs.Projects;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task<ApiResponse<int>> CreateAsync(CreateProjectDto dto);

        Task<ApiResponse<ProjectDto>> GetByIdAsync(
    int projectId,
    int userId,
    string role);

        //Task<ApiResponse<ProjectDto>> GetByIdAsync(int projectId, int userId);

        //Task<IEnumerable<Project>>  GetAllAsync();

        Task<ApiResponse<PaginatedResult<ProjectDto>>> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            ProjectStatus? status);

        Task<ApiResponse<object>> UpdateProjectAsync(
            int projectId,
            UpdateProjectDto dto
            );

        Task<ApiResponse<object>> DeleteProjectAsync(int projectId, string Reason);






    }
}
