using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IProjectAssignmentQueryRepository
    {
        Task<int> GetUserProjectCountAsync(int userId);
        Task<bool> IsUserAlreadyAssignedAsync(int projectId, int userId);
        Task<bool> IsRoleAlreadyAssignedInProjectAsync(int projectId, Role role);


    }
}
