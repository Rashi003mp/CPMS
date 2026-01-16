using ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Commands
{
    public interface IRegistrationCommandRepository
    {
        Task<int> CreateAsync(RegistrationRequest request);

        Task<int> UpdateAsync(RegistrationRequest request);
    }

}
