using ConstructionPM.Application.Interfaces.Services;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace ConstructionPM.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendApprovalEmailAsync(
            string toEmail,
            string fullName,
            string tempPassword)
        {
            var subject = "Account Approved - ConstructionPM";

            var body = $@"Hello {fullName},
                             Your ConstructionPM account has been approved.
                            
                            Login credentials:
                            Email: {toEmail}
                            Temporary Password: {tempPassword}
                            
                            Please log in and change your password immediately.
                            https://localhost:7188/api/auth/login
                            
                            Regards,
                            ConstructionPM Team
                            ";
            var massage = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail),
                Subject = subject,
                Body = body,
            };
            massage.To.Add(toEmail);

            using var smtp = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),

                EnableSsl = _settings.EnableSsl
            };

            await smtp.SendMailAsync(massage);
        }


        public async Task SendPasswordResetEmailAsync(
            string token,
            string toEmail,
            string fullName,
            string resetLink)
        {
            var subject = "Password Reset Request - ConstructionPM";
            var body = $@"Hello {fullName},
                             We received a request to reset your password.

                            Please click the link below to reset your password:
                            {resetLink}
                            or copy the token - {token}

                            If you did not request a password reset, please ignore this email.

                                       
                                Don't Reply to this email.

                            Regards,
                            ConstructionPM Team
                            ";
            var massage = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail),
                Subject = subject,
                Body = body,
            };

            massage.To.Add(toEmail);

            using var smtp = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            await smtp.SendMailAsync(massage);
        }

        public async Task SendRejectionEmailAsync(
            string toEmail,
            string fullName,
            string rejectionReason)
        {
            var subject = "Registration Application - Status Update - ConstructionPM";

            var body = $@"Hello {fullName},

                            Thank you for your interest in ConstructionPM.
                            
                            Unfortunately, your registration application has been rejected.
                            
                            Reason: {rejectionReason}
                            
                            If you have any questions or would like to reapply, please contact our support team.
                            
                            Regards,
                            ConstructionPM Team
                            ";
            var massage = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail),
                Subject = subject,
                Body = body,
            };
            massage.To.Add(toEmail);

            using var smtp = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            await smtp.SendMailAsync(massage);
        }

    }

}
