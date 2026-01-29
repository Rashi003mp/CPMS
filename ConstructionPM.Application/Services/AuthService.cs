using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
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


    //public async Task<string> LoginAsync(LoginRequestDto request)
    //{
    //    var email = request.Email.Trim().ToLower();

    //    var user = await _userQuery.GetForLoginAsync(email);

    //    if (user == null)
    //        throw new UnauthorizedAccessException("Invalid credentials");

    //    if (!user.IsActive)
    //        throw new UnauthorizedAccessException("Your account is inactive");


    //    var result = _passwordService.Verify(
    //                    hashedPassword: user.PasswordHash,
    //        providedPassword: request.Password
    //    );

    //    if (!result)
    //        throw new UnauthorizedAccessException("Invalid credentials");

    //    string roleName = (int)user.RoleId switch
    //    {
    //        0 => "Admin",
    //        1 => "ProjectManager",           
    //        2 => "SiteEngineer",   
    //        3 => "Client",
    //        _ => "User"          
    //    };

    //    return _jwt.GenerateToken(
    //        user.Id,
    //        roleName,
    //        user.Name
    //    );
    //}

    public async Task<ApiResponse<string>> LoginAsync(LoginRequestDto request)
    {
        try
        {
            var email = request.Email.Trim().ToLower();

            var user = await _userQuery.GetForLoginAsync(email);

            // Email not found or deleted
            if (user == null)
            {
                return ApiResponse<string>.ErrorResponse(
                    "Invalid email or password"
                );
            }

            // Account deactivated
            if (!user.IsActive)
            {
                return ApiResponse<string>.ErrorResponse(
                    "Your account is deactivated. Contact admin."
                );
            }

            // Password verification
            var isPasswordValid = _passwordService.Verify(
                hashedPassword: user.PasswordHash,
                providedPassword: request.Password
            );

            if (!isPasswordValid)
            {
                return ApiResponse<string>.ErrorResponse(
                    "Invalid email or password"
                );
            }

            string roleName = (int)user.RoleId switch
            {
                0 => "Admin",
                1 => "ProjectManager",
                2 => "SiteEngineer",
                3 => "Client",
                _ => "User"
            };

            var token = _jwt.GenerateToken(
                user.Id,
                roleName,
                user.Name
            );

            return ApiResponse<string>.SuccessResponse(
                token,
                "Login successful"
            );
        }
        catch (System.Exception ex)
        {
            return ApiResponse<string>.ErrorResponse(
                "An unexpected error occurred. Please try again later."
            );
        }
    }

}
