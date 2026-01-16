using ConstructionPM.Application.DTOs.Admin;
using ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IRegistrationQueryRepository
    {
        Task<IEnumerable<dynamic>> GetPendingAsync();
        Task<RegistrationRequest?> GetByIdAsync(int id);
    }

}
