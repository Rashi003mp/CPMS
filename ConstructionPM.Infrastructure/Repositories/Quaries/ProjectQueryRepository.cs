//using Dapper;
//using ConstructionPM.Application.Interfaces.Repositories.Queries;
//using ConstructionPM.Infrastructure.Dapper;
//using ConstructionPM.Domain.Entities;



//namespace ConstructionPM.Infrastructure.Repositories.Quaries
//{
//    public class ProjectQueryRepository : IProjectQueryRepository
//    {
//        private readonly DapperContext _context;

//        public ProjectQueryRepository(DapperContext context)
//        {
//            _context = context;
//        }

//        public async Task<Project?> GetByIdAsync(int id)
//        {
//            var sql = "SELECT * FROM Projects WHERE Id =@id";

//            using var connection = _context.CreateConnection();
//            return await connection.QuerySingleOrDefaultAsync<Project>(sql, new { id });

//        }

//        public async Task<IEnumerable<Project>> GetAllAsync()
//        {
//            var sql = "SELECT * FROM Projects";

//            using var connection = _context.CreateConnection();
//            return await connection.QueryAsync<Project>(sql);

//        }


//    }
//}
