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
        private readonly IRegistrationQueryRepository _registrationQuery;
        private readonly IRegistrationCommandRepository _registrationCommand;
        private readonly IUserCommandRepository _userCommand;
        private readonly IRoleQueryRepository _roleQuery;
        private readonly IPasswordService _passwordservice;
        private readonly IEmailService _emailService;
        private readonly IGenericRepository<RegistrationRequest> _genericRepo;

        public AdminApprovalService(
            IRegistrationQueryRepository registrationQuery,
            IRegistrationCommandRepository registrationCommand,
            IUserCommandRepository userCommand,
            IRoleQueryRepository roleQuery,
            IPasswordService PasswordService,
            IEmailService emailService,
            IGenericRepository<RegistrationRequest> genericRepo)
        {
            _registrationQuery = registrationQuery;
            _registrationCommand = registrationCommand;
            _userCommand = userCommand;
            _roleQuery = roleQuery;
            _passwordservice = PasswordService;
            _emailService = emailService;
            _genericRepo = genericRepo;
        }

        public async Task ApproveAsync(int requestId)
        {
            var request = await _genericRepo.GetByIdAsync(requestId);
            if (request == null || request.Status != "Pending")
                throw new InvalidOperationException("Invalid registration request");


            var roleId = await _roleQuery.GetRoleIdByNameAsync(request.RoleName);
            if (roleId == null)
                throw new InvalidOperationException("Role not found");

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                RoleId = roleId.Value,
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

        public async Task RejectAsync(int requestId , string rejectionReason)
        {
            var request = await _registrationQuery.GetByIdAsync(requestId);
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
