using ConstructionPM.Application.DTOs;
using ConstructionPM.Application.Validators.Common;
using ConstructionPM.Application.Validators.Interface;


namespace ConstructionPM.Application.Validators.Implimentations
{
    public class AdminUserSetupValidator : IAdminUserSetupValidator
    {
        private readonly ICommonValidator _commonValidator;

        public AdminUserSetupValidator(ICommonValidator commonValidator)
        {
            _commonValidator = commonValidator;
        }

        public void Validate(AdminUserSetupRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            request.Email = _commonValidator.NormalizeAndValidateEmail(request.Email);
            _commonValidator.ValidateName(request.Name);

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required");
        }
    }
}
