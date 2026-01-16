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
        private readonly IRegistrationCommandRepository _command;
        private readonly IRoleQueryRepository _roleQuery;
        private readonly IGenericRepository<RegistrationRequest> _genericRepository;
        private readonly IRegistrationValidator _validator;
        public RegistrationService(IRegistrationCommandRepository command,
            IRoleQueryRepository roleQuery,
            IGenericRepository<RegistrationRequest> genericRepository,
            IRegistrationValidator validator)
        {
            _command = command;
            _roleQuery = roleQuery;
            _genericRepository = genericRepository;
            _validator = validator;
        }

        public async Task RegisterAsync(RegistrationRequestDto request)
        {
            _validator.ValidateRegistrationRequest(request);
            var entity = MapToEntity(request);
            await _genericRepository.AddAsync(entity);
        }

        private static RegistrationRequest MapToEntity(RegistrationRequestDto r)
        {
            var roleName = r.RoleName.ToString();


            return new RegistrationRequest
            {
                Name = r.Name.ToLower().Trim(),
                Email = r.Email.ToLower().Trim(),
                Phone = r.PhoneNumber,
                RoleName = roleName,
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