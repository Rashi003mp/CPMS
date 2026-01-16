using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IRoleQueryRepository
    {
        Task<bool> ExistAsync(string roleName);

        Task<int?> GetRoleIdByNameAsync(string roleName);

    }
}
