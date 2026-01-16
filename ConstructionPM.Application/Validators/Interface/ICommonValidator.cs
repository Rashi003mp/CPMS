namespace ConstructionPM.Application.Validators.Common
{
    public interface ICommonValidator
    {
        void ValidateName(string name);
        string NormalizeAndValidateEmail(string email);
        void ValidatePhone(string phone);
    }
}
