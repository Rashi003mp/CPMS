
using System.ComponentModel.DataAnnotations;

namespace ConstructionPM.Application.DTOs
{
    public class AdminUserSetupRequestDto
    {

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        
    }
}


/* 
- null → temporary placeholder, ! → “compiler, don’t warn me” 

*/