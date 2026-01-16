using ConstructionPM.Application.Interfaces.Auth;
using System.Security.Claims;

namespace ConstrictionPM.API.Services
{
    public class CurrentUserService : ICurrentUserService
    {

        public int? UserId  { get; set; }
        public string? UserName { get; set; }

        public string? Role { get; set; }

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            var user = httpContextAccessor.HttpContext?.User;

            UserId = int.Parse(user?.FindFirst(ClaimTypes.NameIdentifier) ?.Value ?? "0");

            UserName = user?.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            Role = user?.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }
    }
}
