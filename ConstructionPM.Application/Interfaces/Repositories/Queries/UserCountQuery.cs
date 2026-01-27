using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IUserCountQuery
    {
        Task<Dictionary<int, int>> GetActiveProjectCountsAsync();
    }
}
