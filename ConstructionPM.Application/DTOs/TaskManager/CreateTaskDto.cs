using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.TaskManager
{
    public class CreateTaskDto
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int AssignedToUserId { get; set; }
        public DateTime DueDate { get; set; }
    }

}
