using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Comments
{
    public class CommentResponseDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }

        public string Message { get; set; } = null!;

        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
    }

}
