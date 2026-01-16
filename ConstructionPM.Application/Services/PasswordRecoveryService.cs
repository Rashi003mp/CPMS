using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;


public class PasswordRecoveryService : IPasswordRecoveryService
{
    private readonly IUserQueryRepository _userQuery;
    private readonly IUserCommandRepository _userCommand;
    private readonly IEmailService _emailService;
    private readonly IPasswordService _passwordservice;
    public PasswordRecoveryService(
        IUserQueryRepository userQuery,
        IUserCommandRepository userCommand,
        IEmailService emailService,
            IPasswordService PasswordService)
    {
        _userQuery = userQuery;
        _userCommand = userCommand;
        _emailService = emailService;
        _passwordservice = PasswordService;
    }

    // 🔹 FORGOT PASSWORD
    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _userQuery.GetByEntityEmailAsync(email);

        if (user == null)
            return; // security: do not reveal existence

        var token = Guid.NewGuid().ToString();

        user.ResetToken = token;
        user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

        await _userCommand.UpdateAsync(user);

        var resetLink =
            $"https://localhost:7188/reset-password?token={token}"; 

        await _emailService.SendPasswordResetEmailAsync(
            user.ResetToken,
            user.Email,
            user.Name,
            resetLink
        );
    }

    // 🔹 RESET PASSWORD
    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var user = await _userQuery.GetByResetTokenAsync(token);

        if (user == null || user.ResetTokenExpiry < DateTime.UtcNow)
            throw new Exception("Invalid or expired token");


        user.PasswordHash = _passwordservice.HashPassword(newPassword);

       

        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _userCommand.UpdateAsync(user);
    }
}
