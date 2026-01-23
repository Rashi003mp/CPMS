using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Dapper;
using Dapper;
using Microsoft.EntityFrameworkCore;
using ConstructionPM.Infrastructure.Persistence;

namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class ProjectQueryRepository : IProjectQueryRepository
    {
        private readonly DapperContext _context;

        public ProjectQueryRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM Projects WHERE Id =@id";

            using var connection = _context.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Project>(sql, new { id });

        }

        

        public async Task<List<Project>> GetAllAsync()
        {
            var sql = @"SELECT * FROM Projects 
                WHERE IsDeleted = 0 
                ORDER BY CreatedAt DESC";

            using var connection = _context.CreateConnection();
            return (await connection.QueryAsync<Project>(sql)).ToList();
        }
    }
}
