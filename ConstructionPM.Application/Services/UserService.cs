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

        public UserService(IGenericRepository<User> userRepository, IUserCountQuery userCount)
        {
            _userRepository = userRepository;
            _userCount = userCount;
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
    }
}
