using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using ConstructionPM.Infrastructure.Dapper;
using ConstructionPM.Infrastructure.Persistence;
using Dapper;
using Microsoft.EntityFrameworkCore;
using System.Data;


namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class UserQueryRepository : IUserQueryRepository
    {
        private readonly DapperContext _context;
        private readonly AppDbContext _db;

        public UserQueryRepository(DapperContext context, AppDbContext db)
        {
            _context = context;
            _db = db;
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
        WHERE RoleId = @AdminRole
          AND IsDeleted = 0
        """;

            using var connection = _context.CreateConnection();

            var count = await connection.ExecuteScalarAsync<int>(
                sql,
                new { AdminRole = "Admin" }
            );

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


        public async Task<User?> ByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLower();

            return await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

    }
}
