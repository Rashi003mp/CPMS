using ConstructionPM.Application.Interfaces.Factories;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Factories
{
    public class ProjectUsersHistoryFactory : IProjectUsersHistoryFactory
    {

        

        public ProjectUsersHistory Create(
            ProjectUsers assignment,
            string action,
            string? reason = null)
        {
            return new ProjectUsersHistory
            {
                ProjectUserId = assignment.Id,
                ProjectId = assignment.ProjectId,
                RoleId = (int)assignment.RoleId,
                AssignedUserId = assignment.AssignedUserId,
                AssignedUserName = assignment.AssignedUserName,

                Action = action,
                Reason = reason,

                IsDeleted = assignment.IsDeleted
            };
        }
    }

}
