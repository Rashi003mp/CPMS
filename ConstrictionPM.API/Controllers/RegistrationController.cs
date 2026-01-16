using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionPM.API.Controllers
{
    [ApiController]
    [Route("api/registration")]
    public class RegistrationController : ControllerBase
    {
        private readonly IRegistrationService _service;

        public RegistrationController(IRegistrationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromForm] RegistrationRequestDto request)
        {
            await _service.RegisterAsync(request);
            var response = ApiResponse.SuccessResponse("Registration request submitted");
            return Ok(response);

        }
    }

}
