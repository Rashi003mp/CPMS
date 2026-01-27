using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<ApiResponse<List<UserListDto>>> GetAllUsersAsync();
        Task<ApiResponse<UserDetailDto>> GetUserByIdAsync(int userId);
    }
}
