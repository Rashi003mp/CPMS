using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Validators.Common;
using ConstructionPM.Application.Validators.Interface;
using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Validators.Implimentations
{
    public class RegistrationValidator : IRegistrationValidator
    {

        private readonly ICommonValidator _commonValidator;

        public RegistrationValidator(ICommonValidator commonValidator)
        {
            _commonValidator = commonValidator;
        }

        public void ValidateRegistrationRequest(RegistrationRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            request.Email = _commonValidator.NormalizeAndValidateEmail(request.Email);
            _commonValidator.ValidateName(request.Name);
            _commonValidator.ValidatePhone(request.PhoneNumber);

            ValidateByRole(request);
        }

        private static void ValidateByRole(RegistrationRequestDto request)
        {
            switch (request.RoleName)
            {
                case RegistrationRole.ProjectManager:
                    ValidateProjectManager(request);
                    break;

                case RegistrationRole.SiteEngineer:
                    ValidateSiteEngineer(request);
                    break;

                case RegistrationRole.Client:
                    ValidateClient(request);
                    break;

                default:
                    throw new ArgumentException("Invalid role");


            }
        }

        private static void ValidateProjectManager(RegistrationRequestDto request)
        {
            if (request.ExperienceYears is null || request.ExperienceYears <= 0)
                throw new ArgumentException("ExperienceYear is required must be graeter that 0 for ProjrctManger");
        }

        private static void ValidateSiteEngineer(RegistrationRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Skills))
                throw new ArgumentException("Skill is required for SiteEngineer");
        }

        private static void ValidateClient(RegistrationRequestDto request)
        {
            if (string.IsNullOrEmpty(request.ProjectName))
                throw new ArgumentException("Project Name is required for clients");
        }



    }
}
