using ConstructionPM.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Validators.Interface
{
    public interface IRegistrationValidator
    {
        void ValidateRegistrationRequest(RegistrationRequestDto request);
    }
}
