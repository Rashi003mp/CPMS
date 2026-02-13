using ConstructionPM.Application.DTOs.Projects.GetProjects;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
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

        public async Task<ProjectDto?> GetByIdDashboardAsync(int projectId)
        {
            var sql = @"
            SELECT 
                p.Id,
                p.ProjectName AS Name,
                p.Description,
                p.Status,
                p.CreatedAt,
                p.CreatedByUserName,
                pu.RoleId,
                pu.AssignedUserName
            FROM Projects p
            LEFT JOIN ProjectUsers pu ON pu.ProjectId = p.Id
            WHERE p.Id = @ProjectId";
            var connection = _context.CreateConnection();
            var result = await connection.QueryAsync(sql, new { ProjectId = projectId });

            if (!result.Any())
                return null;

            var firstRow = result.First();

            var dto = new ProjectDto
            {
                Id = firstRow.Id,
                Name = firstRow.Name,
                Description = firstRow.Description,
                Status = firstRow.Status.ToString(),
                CreatedAt = firstRow.CreatedAt,
                CreatedByUserName = firstRow.CreatedByUserName,
                SiteEngineerName = new List<string>()
            };

            foreach (var row in result)
            {
                if (row.RoleId == (int)Role.ProjectManager)
                    dto.ProjectManagerName = row.AssignedUserName;

                if (row.RoleId == (int)Role.SiteEngineer)
                    dto.SiteEngineerName.Add(row.AssignedUserName);
            }

            return dto;
        }
    }
}

