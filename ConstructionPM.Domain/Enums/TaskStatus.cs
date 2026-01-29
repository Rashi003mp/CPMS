using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Enums
{
    public enum DomainTaskStatus
    {
        Todo = 0,
        InProgress = 1,
        Blocked = 2,
        Completed = 3,
        Cancelled = 4
    }
}
