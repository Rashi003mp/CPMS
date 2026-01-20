using ConstructionPM.Application.DTOs.Response;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Utilities;
using ConstructionPM.Domain.Entities;


namespace ConstructionPM.Application.Services
{
    public class AdminApprovalService : IAdminApprovalService
    {
        private readonly IUserCommandRepository _userCommand;
        private readonly IPasswordService _passwordservice;
        private readonly IEmailService _emailService;
        private readonly IGenericRepository<RegistrationRequest> _genericRepo;

        public AdminApprovalService(
            IUserCommandRepository userCommand,
            IPasswordService PasswordService,
            IEmailService emailService,
            IGenericRepository<RegistrationRequest> genericRepo)
        {
            _userCommand = userCommand;
            _passwordservice = PasswordService;
            _emailService = emailService;
            _genericRepo = genericRepo;
        }

        public async Task ApproveAsync(int requestId)
        {
            // give condition to check id
            var request = await _genericRepo.GetByIdAsync(requestId);
            if (request == null || request.Status != "Pending")
                throw new InvalidOperationException("Invalid registration request");

            if (await _userCommand.ExistsByEmailAsync(request.Email))
            {
                throw new InvalidOperationException("Email already exists");
            }





            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                RoleId = request.RoleName,
                Phone = request.Phone
            };

            // Temporary password strategy ( can later reset)
            var tempPassword = PasswordGenerator.GenerateTempPassword();

            Console.WriteLine(tempPassword);

            user.PasswordHash = _passwordservice.HashPassword(tempPassword);

            await _userCommand.CreateAsync(user);/**/

            request.Status = "Approved";
            await _genericRepo.UpdateAsync(request);/**/

            await _emailService.SendApprovalEmailAsync(
                user.Email,
                user.Name,
                tempPassword
    );
        }

        public async Task RejectAsync(int requestId, string rejectionReason)
        {
            var request = await _genericRepo.GetByIdAsync(requestId);
            if (request == null || request.Status != "Pending")
                throw new InvalidOperationException("Invalid registration request");
            request.Status = "Rejected";
            request.RejectionReason = rejectionReason;
            await _genericRepo.UpdateAsync(request);

            await _emailService.SendRejectionEmailAsync(
                request.Email,
                request.Name,
                rejectionReason);
        }



    }
}
