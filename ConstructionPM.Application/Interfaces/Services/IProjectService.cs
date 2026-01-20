using ConstructionPM.Application.DTOs;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task CreateAsync(CreateProjectDto dto);

        Task<Project> GetByIdAsync(int id);

        Task<IEnumerable<Project>>  GetAllAsync();




    }
}
