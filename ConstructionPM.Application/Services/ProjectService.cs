using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;


namespace ConstructionPM.Application.Services
{


    public class ProjectService : IProjectService
    {


        private readonly IGenericRepository<Project> _repository;


        public ProjectService(IGenericRepository<Project> repository)
        {
            _repository = repository;
        }
        public async Task CreateAsync(CreateProjectDto dto)
        {
            var Project = new Project
            {
                ProjectName = dto.ProjectName,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status.ToString()
            };

            await _repository.AddAsync(Project);
        }

        public async Task<Project> GetByIdAsync(int id)
        {
            var project = await _repository.GetByIdAsync(id);

            if (project == null)
                throw new DirectoryNotFoundException($"Project with id {id} not found");

            return project;
        }

        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }
    }
}
