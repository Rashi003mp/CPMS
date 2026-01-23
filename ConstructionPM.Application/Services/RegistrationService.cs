using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Validators.Interface;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;


namespace ConstructionPM.Application.Services
{
    public class RegistrationService : IRegistrationService
    {
        private readonly IUserCommandRepository _userCommand;
        private readonly IRegistrationCommandRepository _command;
        private readonly IGenericRepository<RegistrationRequest> _genericRepository;
        private readonly IRegistrationValidator _validator;
        public RegistrationService(IRegistrationCommandRepository command,
            IGenericRepository<RegistrationRequest> genericRepository,
            IRegistrationValidator validator,
            IUserCommandRepository userCommand)
        {
            _command = command;
            _genericRepository = genericRepository;
            _validator = validator;
            _userCommand = userCommand;
        }

        public async Task RegisterAsync(RegistrationRequestDto request)
        {

            _validator.ValidateRegistrationRequest(request);

            var emailExists = await _userCommand.ExistsByEmailAsync(request.Email);
            if (emailExists)
            {
                throw new InvalidOperationException("Email already exists");
            }
         

            var entity = MapToEntity(request);

            try 
            { 
                await _genericRepository.AddAsync(entity); 
            }
            catch (System.Exception ex)
            {
                throw new ApplicationException("An error occurred while processing the registration request.", ex);
            }

        }

        private static RegistrationRequest MapToEntity(RegistrationRequestDto r)
        {
            return new RegistrationRequest
            {
                Name = r.Name.ToLower().Trim(),
                Email = r.Email,
                Phone = r.PhoneNumber,
                RoleName = r.RoleName,
                ExperienceYears = r.ExperienceYears,
                Skills = r.Skills,
                ProjectName = r.ProjectName,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
        }
    }
}