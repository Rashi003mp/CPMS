using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Auth
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(int userId, string roleName , string userName);
    }
}
