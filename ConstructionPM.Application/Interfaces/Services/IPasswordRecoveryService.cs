using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IPasswordRecoveryService
    {
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}
