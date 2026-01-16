using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Interfaces.Repositories.Commands
{
    public interface IRoleCommandRepository
    {
        Task<int> CreateAsync(Role Role);
    }
}
