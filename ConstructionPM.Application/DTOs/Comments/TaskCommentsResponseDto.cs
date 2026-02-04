using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Comments
{
    public class TaskCommentsResponseDto
    {
        public int TaskId { get; set; }
        public List<CommentResponseDto> Comments { get; set; } = new();
    }

}
