using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Comments
{
    public class CreateCommentInternalDto
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string Message { get; set; } = null!;

        public string Role { get; set; }

    }


}
