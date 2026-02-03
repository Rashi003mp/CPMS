using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Factories
{
    public interface IProjectUsersHistoryFactory
    {
        ProjectUsersHistory Create(
            ProjectUsers assignment,
            string action,
            string? reason = null);
    }

}
