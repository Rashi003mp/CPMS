using ConstructionPM.Application.DTOs.Admin;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Dapper;
using Dapper;
using System.Data;

namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class RegistrationQueryRepository : IRegistrationQueryRepository
    {
        
        private readonly IDbConnection _db;

        public RegistrationQueryRepository(IDbConnection db)
        {
            
            _db = db;
        }

        public async Task<IEnumerable<dynamic>> GetPendingAsync()
        {
            const string sql = """
            SELECT Id, Name, Email, RoleName, CreatedAt
            FROM RegistrationRequests
            WHERE Status = 'Pending'
              AND IsDeleted = 0
            ORDER BY CreatedAt
        """;

            return await _db.QueryAsync<dynamic>(sql);
        }

        public async Task<RegistrationRequest?> GetByIdAsync(int id)
        {
            const string sql = """
            SELECT *
            FROM RegistrationRequests
            WHERE Id = @Id
              AND IsDeleted = 0
        """;

            return await _db.QueryFirstOrDefaultAsync<RegistrationRequest>(
                sql,
                new { Id = id }
            );
        }
    }

}
