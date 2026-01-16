using System.Text.RegularExpressions;

namespace ConstructionPM.Application.Validators.Common
{
    public class CommonValidator : ICommonValidator
    {
        private static readonly Regex NameRegex =
            new(@"^[a-zA-Z\s'-]{1,50}$");

        private static readonly Regex EmailRegex =
            new(@"^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$");

        private static readonly Regex PhoneRegex =
            new(@"^(\+91[ \-\s]?)?[6-9]\d{9}$");

        public void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name is required");

            if (!NameRegex.IsMatch(name))
                throw new ArgumentException("Invalid name format");
        }

        public string NormalizeAndValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required");

            var normalized = email.Trim().ToLowerInvariant();

            if (!EmailRegex.IsMatch(normalized))
                throw new ArgumentException("Invalid email format");

            return normalized;
        }

        public void ValidatePhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone number is required");

            if (!PhoneRegex.IsMatch(phone))
                throw new ArgumentException("Invalid phone number format (+91 or 10 digits)");
        }
    }
}
