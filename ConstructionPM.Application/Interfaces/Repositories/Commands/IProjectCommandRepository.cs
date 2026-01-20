using ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Commands
{
    public interface IProjectCommandRepository
    {
        Task<bool> ExistsByNameAsync(string name);
    }
}
