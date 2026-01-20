using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Domain.Entities;
using Microsoft.AspNetCore.Identity;


namespace ConstructionPM.Infrastructure.Auth
{
    public class PasswordService : IPasswordService
    {
        private readonly IPasswordHasher<User> _hasher;

        public PasswordService(IPasswordHasher<User> hasher)
        {
            _hasher = hasher;
        }
        
        public string HashPassword(string password)
        {
            return _hasher.HashPassword(null!, password);
        }

        public bool Verify(string hashedPassword, string providedPassword)
        {
            var result = _hasher.VerifyHashedPassword(
                null!,
                hashedPassword,
                providedPassword
            );

            return result != PasswordVerificationResult.Failed;
        }

    }
}
