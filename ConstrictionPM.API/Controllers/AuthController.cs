using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionPM.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserQueryRepository _userQuery;
    private readonly IJwtTokenGenerator _jwt;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IPasswordRecoveryService _service;

    public AuthController(
        IUserQueryRepository userQuery,
        IJwtTokenGenerator jwt,
        IPasswordHasher<User> passwordHasher,
        IPasswordRecoveryService service
        )
    {
        _userQuery = userQuery;
        _jwt = jwt;
        _passwordHasher = passwordHasher;
        _service = service;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var user = await _userQuery.GetForLoginAsync(request.Email);
        if (user == null)
            return Unauthorized("Invalid credentials");

        // Password verification
        var result = _passwordHasher.VerifyHashedPassword(
            user: null!,                  
            hashedPassword: user.PasswordHash,
            providedPassword: request.Password
        );

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials");

        var token = _jwt.GenerateToken(
            user.Id,
            user.RoleName.ToString(),
            user.Name
        );

        return Ok(new { token });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequestDto dto)
    {
        await _service.ForgotPasswordAsync(dto.Email);
        return Ok("If the email exists, a reset link has been sent.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequestDto dto)
    {
        await _service.ResetPasswordAsync(dto.Token, dto.NewPassword);
        return Ok("Password reset successful.");
    }
}
