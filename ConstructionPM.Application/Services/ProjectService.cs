using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;


namespace ConstructionPM.Application.Services
{
    

    public class ProjectService : IProjectService
    {

        private readonly IProjectCommandRepository _command;
        private readonly IProjectQueryRepository _query;

        public ProjectService(IProjectCommandRepository command,IProjectQueryRepository query)
        {
            _command = command;
            _query = query;
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

            await _command.CreateAsync(Project);
        }

        public async Task<Project?> GetByIdAsync(int id)
        {
            //throw new NotImplementedException();
            return await _query.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await _query.GetAllAsync();
        }
    }
}
