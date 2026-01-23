using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects.CreateProject;
using ConstructionPM.Application.Interfaces;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectCommandRepository _projectRepository;
        private readonly IProjectStatusHistoryCommandRepository _historyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ProjectService(
            IProjectCommandRepository projectRepository,
            IProjectStatusHistoryCommandRepository historyRepository,
            IUnitOfWork unitOfWork)
        {
            _projectRepository = projectRepository;
            _historyRepository = historyRepository;
            _unitOfWork = unitOfWork;
        }

        //public Task CreateAsync(CreateProjectDto dto)
        //{
        //    throw new NotImplementedException();
        //}

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

        public Task<Project> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
