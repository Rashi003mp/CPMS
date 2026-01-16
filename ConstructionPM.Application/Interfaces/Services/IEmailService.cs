using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendApprovalEmailAsync(
            string toEmail,
            string fullName,
            string tempPassword
        );
        Task SendPasswordResetEmailAsync(
            string token,
           string toEmail,
           string fullName,
           string resetLink);
    }
}
