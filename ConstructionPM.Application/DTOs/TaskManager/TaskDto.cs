using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.TaskManager
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int AssignedToUserId { get; set; }
        public DateTime DueDate { get; set; }
        public DomainTaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
