using Azure.Core;
using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ConstrictionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddRoleController : ControllerBase
    {
        private readonly IRoleCommandRepository _command;
        private readonly IRoleQueryRepository _query;

        public AddRoleController(IRoleCommandRepository command, IRoleQueryRepository query  )
        {
            _command = command;
            _query = query;
        }

        [HttpPost]
        public async Task <IActionResult> Create(CreateRoleRequestDto
            request)
        {
            if (string.IsNullOrWhiteSpace(request.RoleName))
                return BadRequest("Role name is required");

            if (await _query.ExistAsync(request.RoleName))
                return Conflict("Role already exists");

            var role = new Role
            {
                RoleName = request.RoleName.Trim(),
                Description = request.Description.Trim()
            };

            await _command.CreateAsync (role);

            return Ok("Role created successfully");
        }

    }
}
