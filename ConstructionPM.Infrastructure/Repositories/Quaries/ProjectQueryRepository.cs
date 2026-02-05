using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Dapper;
using Dapper;


namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class ProjectQueryRepository : IProjectQueryRepository
    {
        private readonly DapperContext _context;

        public ProjectQueryRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<bool> IsProjectNameExistsAsync(string projectName)
        {
            const string sql = @"
            SELECT COUNT(1)
            FROM Projects
            WHERE ProjectName = @ProjectName
              AND IsDeleted = 0
        ";

            using var connection = _context.CreateConnection();

            var count = await connection.ExecuteScalarAsync<int>(
                sql,
                new { ProjectName = projectName }
            );

            return count > 0;
        }

        public async Task<Project?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM Projects WHERE Id =@id";

            using var connection = _context.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Project>(sql, new { id });

        }

        

        public async Task<List<Project>> GetAllAsync()
        {
            //throw new System.Exception();
            var sql = @"SELECT * FROM Projects 
                WHERE IsDeleted = 0 
                ORDER BY CreatedAt DESC";

            using var connection = _context.CreateConnection();
            return (await connection.QueryAsync<Project>(sql)).ToList();
        }
    }
}
