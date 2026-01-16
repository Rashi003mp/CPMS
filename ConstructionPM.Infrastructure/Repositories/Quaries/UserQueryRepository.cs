using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Infrastructure.Dapper;
using Dapper;
using System.Data;
using ConstructionPM.Domain.Entities;


namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class UserQueryRepository : IUserQueryRepository
    {
        private readonly DapperContext _context;

        public UserQueryRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            var sql = """
            SELECT u.Id, u.Name, u.Email, r.RoleName
            FROM Users u
            JOIN Roles r ON u.RoleId = r.Id
            WHERE u.Email = @Email
        """;

            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Email = email });
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var sql = """
            SELECT u.Id, u.Name, u.Email, r.RoleName
            FROM Users u
            JOIN Roles r ON u.RoleId = r.Id
            WHERE u.Id = @Id
        """;

            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Id = id });
        }

        public async Task<bool> AdminUserExistsAsync()
        {
            const string sql = """
                SELECT COUNT(1)
                FROM Users
                INNER JOIN Roles ON Users.RoleId = Roles.Id
                WHERE Roles.RoleName = 'Admin'
                  AND Users.IsDeleted = 0
                """;
            using var connection = _context.CreateConnection();

            var count = await connection.ExecuteScalarAsync<int>(sql);
            return count > 0;
        }

        public async Task<UserWithPasswordDto?> GetForLoginAsync(string email)
        {
            using var connection = _context.CreateConnection();

            return await connection.QueryFirstOrDefaultAsync<UserWithPasswordDto>(
                "GetUserForLogin",
                new { Email = email },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<User?> GetByResetTokenAsync(string token)
        {
            const string sql = """
            SELECT *
            FROM Users
            WHERE ResetToken  = @token
              AND IsDeleted = 0
        """;
            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Token = token });
        }

        public async Task<User?> GetByEntityEmailAsync(string email)
        {
            var sql = """
            SELECT *
            FROM Users 
            WHERE Email = @email
            AND IsDeleted = 0
        """;

            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }




    }
}
