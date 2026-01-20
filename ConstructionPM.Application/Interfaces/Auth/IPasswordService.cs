using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Auth
{
    public interface IPasswordService
    {
        string HashPassword(string password);
         bool Verify(string hashedPassword, string providedPassword);
    }

}
