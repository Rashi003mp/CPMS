using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ConstructionPM.Application.DTOs;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IProjectQueryRepository
    {
        Task<IEnumerable<Project>> GetAllAsync();
        Task<Project?> GetByIdAsync(int id);
    }
}
