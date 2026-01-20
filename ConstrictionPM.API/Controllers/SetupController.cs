using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ConstructionPM.Application.Validators.Interface;

namespace ConstrictionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetupController : ControllerBase
    {
        private readonly IUserQueryRepository _userQuery;
        private readonly IUserCommandRepository _userCommand;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IAdminUserSetupValidator _adminSetupValidator;

        public SetupController(
            IUserQueryRepository userQuery,
            IUserCommandRepository userCommand,
            IPasswordHasher<User> passwordHasher,
            IAdminUserSetupValidator adminSetupValidator)
        {
            _userQuery = userQuery;
            _userCommand = userCommand;
            _passwordHasher = passwordHasher;
            _adminSetupValidator = adminSetupValidator;
        }

        [HttpPost("initialize-admin")]
        public async Task<IActionResult> InitializeAdmin(AdminUserSetupRequestDto request)
        {
            _adminSetupValidator.Validate(request);

            if (await _userQuery.AdminUserExistsAsync())
                return StatusCode(
            StatusCodes.Status409Conflict,
            ApiResponse.ErrorResponse(
                "Admin user already exists",
                HttpContext.TraceIdentifier
            )
        );

            var admin = new User
            {
                Name = request.Name,
                Email = request.Email,
                RoleId = 0

            };

            admin.PasswordHash = _passwordHasher.HashPassword(admin, request.Password);

            await _userCommand.CreateAsync(admin);

            return Ok(
        ApiResponse.SuccessResponse(
            "Admin user created successfully",
            HttpContext.TraceIdentifier
        )
    );


        }

    }
}
