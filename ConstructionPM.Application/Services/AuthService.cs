using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace ConstructionPM.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserQueryRepository _userQuery;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenGenerator _jwt;

    public AuthService(
    IUserQueryRepository userQuery,
    IPasswordService passwordService,
    IJwtTokenGenerator jwt)
    {
        _userQuery = userQuery;
        _passwordService = passwordService;
        _jwt = jwt;
    }


    public async Task<string> LoginAsync(LoginRequestDto request)
    {
        var email = request.Email.Trim().ToLower();

        var user = await _userQuery.GetForLoginAsync(email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid credentials");

        var result = _passwordService.Verify(
                        hashedPassword: user.PasswordHash,
            providedPassword: request.Password
        );

        if (!result)
            throw new UnauthorizedAccessException("Invalid credentials");

        return _jwt.GenerateToken(
            user.Id,
            user.RoleId.ToString(),
            user.Name
        );
    }
}
