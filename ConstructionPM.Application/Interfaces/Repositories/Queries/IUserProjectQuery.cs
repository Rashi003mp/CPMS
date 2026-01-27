using ConstructionPM.Application.DTOs.Dapper_models;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IUserProjectQuery
    {
        Task<List<UserProjectDetailRow>> GetUserProjectDetailsAsync(int userId);
    }
}
