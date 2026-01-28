using ConstructionPM.Application.DTOs.AssignUser;
using ConstructionPM.Application.DTOs.Projects.ProjectUsers;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectUsersController : ControllerBase
    {
        private readonly IProjectUsersService _projectUserService;

        public ProjectUsersController(IProjectUsersService projectUserService)
        {
            _projectUserService = projectUserService;
        }

        [HttpPost("{projectId}/assign-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            AssignUserToProject
            (
            int projectId, AssignProjectUserDto dto
            )

        {
            var result = await _projectUserService.AssignUserToProjectAsync(projectId, dto);
            if (!result.Success)
            {
                return BadRequest(result);

            }
            else
            {
                return Ok(result);
            }


        }

        [HttpPost("unassign-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnassignUser(UnassignUserDto dto)
        {
            var response = await _projectUserService.UnassignUserAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}



