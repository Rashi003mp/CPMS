using ConstructionPM.Application.Interfaces.Repositories.Queries;
using System.Data;
using Dapper;   

namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class UserCountQuery : IUserCountQuery
    {
        private readonly IDbConnection _db;

        public UserCountQuery(IDbConnection connection)
        {
            _db = connection;
        }
        public async Task<Dictionary<int, int>> GetActiveProjectCountsAsync()
        {
        //    const string sql = @"
        //    SELECT 
        //        pu.AssignedUserId AS UserId,
        //        COUNT(*) AS ActiveProjectCount
        //    FROM ProjectUsers pu
        //    INNER JOIN Projects p ON p.Id = pu.ProjectId
        //    WHERE pu.IsDeleted = 0
        //      AND p.IsDeleted = 0
        //    GROUP BY pu.AssignedUserId
        //";

            const string sql = @"
            SELECT 
                pu.AssignedUserId AS UserId,
                COUNT(*) AS ActiveProjectCount
            FROM ProjectUsers pu
            INNER JOIN Projects p ON p.Id = pu.ProjectId
            WHERE pu.IsDeleted = 0
              AND p.IsDeleted = 0
              AND pu.Action = 'Assigned'  -- ✅ Only active assignments
            GROUP BY pu.AssignedUserId
             ";


            var result = await _db
           .QueryAsync<(int UserId, int ActiveProjectCount)>(sql);

            return result.ToDictionary(
                x => x.UserId,
                x => x.ActiveProjectCount
            );
        }
    }
}
