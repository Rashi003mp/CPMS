using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.Dapper_models
{
    public class UserProjectDetailRow
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;

        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = null!;
        public int ProjectStatus { get; set; }
        public int UserRoleInProject { get; set; }
    }
}
