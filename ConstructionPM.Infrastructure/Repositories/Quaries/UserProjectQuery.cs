using ConstructionPM.Application.DTOs.Dapper_models;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using Dapper;
using System.Data;

namespace ConstructionPM.Infrastructure.Repositories.Queries;

public class UserProjectQuery : IUserProjectQuery
{
    private readonly IDbConnection _connection;

    public UserProjectQuery(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<List<UserProjectDetailRow>> GetUserProjectDetailsAsync(int userId)
    {
        const string sql = """
            SELECT *
            FROM vw_UserProjectDetails
            WHERE UserId = @UserId
        """;

        var rows = await _connection.QueryAsync<UserProjectDetailRow>(
            sql,
            new { UserId = userId }
        );

        return rows.ToList();
    }
}
