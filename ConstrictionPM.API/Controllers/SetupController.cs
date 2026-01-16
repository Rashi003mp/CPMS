using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ConstrictionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetupController : ControllerBase
    {
        private readonly IUserQueryRepository _userQuery;
        private readonly IUserCommandRepository _userCommand;
        private readonly IPasswordHasher<User> _passwordHasher;

        public SetupController(
            IUserQueryRepository userQuery,
            IUserCommandRepository userCommand,
            IPasswordHasher<User> passwordHasher)
        {
            _userQuery = userQuery;
            _userCommand = userCommand;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("initialize-admin")]
        public async Task<IActionResult> InitializeAdmin(AdminUserSetupRequestDto request)
        {
            if (await _userQuery.AdminUserExistsAsync())
                return Forbid("Admin user already exists");

            var admin = new User
            {
                Name = request.Name,
                Email = request.Email,
                RoleId = RegistrationRole.Admin

            };

            admin.PasswordHash = _passwordHasher.HashPassword(admin, request.Password);

            await _userCommand.CreateAsync(admin);

            return Ok("Admin user created successfully.");


        }

    }
}
