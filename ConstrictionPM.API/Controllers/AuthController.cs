using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Services;
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
    private readonly IAuthService _authService;

    public AuthController(
        IUserQueryRepository userQuery,
        IJwtTokenGenerator jwt,
        IPasswordHasher<User> passwordHasher,
        IPasswordRecoveryService service,
        IAuthService authService
        )
    {
        _userQuery = userQuery;
        _authService = authService;
        _jwt = jwt;
        _passwordHasher = passwordHasher;
        _service = service;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var token = await _authService.LoginAsync(request);
        var reponse = ApiResponse<string>.SuccessResponse(token);
        return Ok(reponse);
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
