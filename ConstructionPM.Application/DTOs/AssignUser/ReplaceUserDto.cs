using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.DTOs.AssignUser
{
    public class ReplaceUserDto
    {
        public int ProjectId { get; set; }

        public int OldUserId { get; set; }
        public int NewUserId { get; set; }

        public int RoleId { get; set; }

        public string Reason { get; set; } = null!;
    }
}
