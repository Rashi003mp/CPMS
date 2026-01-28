using Azure.Core;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.DTOs.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ConstrictionPM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles= "Admin,ProjectManager")]
    public class RegistrationController : ControllerBase
    {
        private readonly IRegistrationQueryRepository _query;
        private readonly IAdminApprovalService _service;

        public RegistrationController(
            IAdminApprovalService service,
            IRegistrationQueryRepository query)
        {
            _query = query;
            _service = service;
        }

        [HttpGet("requests/pending")]
        public async Task<IActionResult> GetPending()
        {
            var data = await _query.GetPendingAsync();
            var response = ApiResponse<IEnumerable<dynamic>>.SuccessResponse(data);
            return Ok(response);
        }

        [HttpPost("requests/{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            
            await _service.ApproveAsync(id);
            var response = ApiResponse.SuccessResponse("Registration approved");
            return Ok(response);
        }

        [HttpPost("requests/{id}/reject")]
        public async Task<IActionResult> Reject(int id,  string rejectionReason)
        {
            await _service.RejectAsync(id, rejectionReason);
            var response = ApiResponse.SuccessResponse("Registration rejected");
            return Ok(response);
        }
    }
}
