using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IProjectUsersService
    {
        Task<ApiResponse<object>> AssignUserToProjectAsync(int projectId, AssignProjectUserDto dto);
    }
}
