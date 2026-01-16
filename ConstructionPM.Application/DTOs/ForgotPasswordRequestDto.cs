using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace ConstructionPM.Application.DTOs
{
    public class ForgotPasswordRequestDto
    {
        [Required]

        [EmailAddress]
        public string Email { get; set; }
    }

}
