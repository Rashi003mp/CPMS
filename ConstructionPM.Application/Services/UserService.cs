using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.DTOs.Users;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IUserCountQuery _userCount;
        private readonly IUserProjectQuery _userProjectQuery;

        public UserService(IGenericRepository<User> userRepository,
            IUserCountQuery userCount,
            IUserProjectQuery userProjectQuery)
        {
            _userRepository = userRepository;
            _userCount = userCount;
            _userProjectQuery = userProjectQuery;
        }

        public async Task<ApiResponse<List<UserListDto>>> GetAllUsersAsync()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();

                var projectCounts = await _userCount
                    .GetActiveProjectCountsAsync();

                var result = users
                    .Where(u => !u.IsDeleted)
                    .Select(u => new UserListDto
                    {
                        UserId = u.Id,
                        UserName = u.Name,
                        Email = u.Email,
                        ActiveProjectCount =
                            projectCounts.TryGetValue(u.Id, out var count)
                                ? count
                                : 0
                    })
                    .ToList();

                return ApiResponse<List<UserListDto>>
                    .SuccessResponse(result);
            }
            catch (System.Exception)
            {
                return ApiResponse<List<UserListDto>>
                    .ErrorResponse("Unable to fetch users");
            }
        }

        public async Task<ApiResponse<UserDetailDto>> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _userRepository
                    .GetByIdAsync(userId);

                if (user == null || user.IsDeleted)
                {
                    return ApiResponse<UserDetailDto>
                        .ErrorResponse("User not found");
                }

                var rows = await _userProjectQuery
                .GetUserProjectDetailsAsync(userId);

                var dto = new UserDetailDto
                {
                    UserId = user.Id,
                    UserName = user.Name,
                    Email = user.Email,
                    Projects = rows.Select(r => new UserProjectDto
                    {
                        ProjectId = r.ProjectId,
                        ProjectName = r.ProjectName,
                        ProjectStatus = r.ProjectStatus,
                        UserRoleInProject = r.UserRoleInProject
                    }).ToList(),
                    Roles = rows
                   .Select(r => r.UserRoleInProject)
                   .Distinct()
                   .ToList(),
                    ActiveProjectCount = rows.Count
                };

                return ApiResponse<UserDetailDto>
                    .SuccessResponse(dto);
            }
            catch
            {
                return ApiResponse<UserDetailDto>
                    .ErrorResponse("Unable to fetch user details");
            }
        }
    }
}

