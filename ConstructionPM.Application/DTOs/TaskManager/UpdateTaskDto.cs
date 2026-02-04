using ConstructionPM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.TaskManager
{
    public class UpdateTaskDto
    {
        [Required]
        public int TaskId { get; set; }

        public int? ProjectId { get; set; }

        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public int? AssignedToUserId { get; set; }

        public DateTime? DueDate { get; set; }

        public DomainTaskStatus? Status { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }
    }

}
