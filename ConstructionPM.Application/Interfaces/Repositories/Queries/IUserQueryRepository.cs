using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Users;
using ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories.Queries
{
    public interface IUserQueryRepository
    {
        Task<UserDto?> GetByIdAsync(int id);
        Task<UserDto?> GetByEmailAsync(string email);

        Task<bool> AdminUserExistsAsync();

        Task<UserWithPasswordDto?> GetForLoginAsync(string email);

        Task<User?> GetByResetTokenAsync(string token);

        Task<User?> GetByEntityEmailAsync(string email);

        Task<User?> ByEmailAsync(string email);

    }
}
