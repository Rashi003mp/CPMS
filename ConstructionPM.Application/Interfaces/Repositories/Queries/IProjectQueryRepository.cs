using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IProjectQueryRepository
    {
        //Task<IEnumerable<Project>> GetAllAsync();
        Task<Project?> GetByIdAsync(int id);

        Task<List<Project>> GetAllAsync();

        Task<bool> IsProjectNameExistsAsync(string projectName);

        Task<ProjectDto?> GetByIdDashboardAsync(int projectId);
    }
}
