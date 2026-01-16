using ConstructionPM.Application.DTOs;
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

        private static readonly Regex NameRegex = new(@"^[a-zA-Z\s'-]{1,50}$");
        private static readonly Regex EmailRegex = new(
            @"^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$");
        private static readonly Regex PhoneRegex = new(@"^(\+91[ \-\s]?)?[6-9]\d{9}$");
        public void ValidateRegistrationRequest(RegistrationRequestDto request)
        {
            NormalizeEmail(request);

            ValidateCommonFields(request);
            ValidateByRole(request);
        }

        private static void NormalizeEmail(RegistrationRequestDto request)
        {
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                request.Email = request.Email.Trim().ToLowerInvariant();
            }
        }
        private static void ValidateCommonFields(RegistrationRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Name is required");
            if (!NameRegex.IsMatch(request.Name))
                throw new ArgumentException("Invalid name format");
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required");
            if (!EmailRegex.IsMatch(request.Email))
                throw new ArgumentException("Invalid email format");

            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                throw new ArgumentException("Phone number is required");
            if (!PhoneRegex.IsMatch(request.PhoneNumber))
                throw new ArgumentException("Invalid phone number format(+91 or 10 digits) ");

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
