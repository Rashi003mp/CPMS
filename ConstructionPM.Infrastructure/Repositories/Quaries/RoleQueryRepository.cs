using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Infrastructure.Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;

namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class RoleQueryRepository : IRoleQueryRepository
    {
        private readonly DapperContext _context;

        public RoleQueryRepository(DapperContext context)
        {
            _context = context;
        }
        public async Task<bool> ExistAsync(string roleName)
        {
            var sql = """
        SELECT COUNT(1)
        FROM Roles
        WHERE RoleName = @RoleName
          AND IsDeleted = 0
    """;

            using var connection = _context.CreateConnection();

            return await connection.ExecuteScalarAsync<int>(sql, new { RoleName = roleName }) > 0;
        }

        public async Task<int?> GetRoleIdByNameAsync(string roleName)
        {
            const string sql = """
        SELECT ID 
        FROM Roles
        WHERE RoleName = @RoleName
          AND IsDeleted = 0
        """;

             using var connection = _context.CreateConnection();
            // Optional but explicit:
            // await connection.OpenAsync();

            var id = await connection.QuerySingleOrDefaultAsync<int?>(sql, new { RoleName = roleName });
            return id;
        }


    }
}
