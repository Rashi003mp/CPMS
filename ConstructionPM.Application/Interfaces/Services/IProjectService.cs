using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task <int>CreateAsync(CreateProjectDto dto);

        Task<Project> GetByIdAsync(int id);

        Task<IEnumerable<Project>>  GetAllAsync();




    }
}
