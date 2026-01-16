using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IAdminApprovalService
    {
        Task ApproveAsync(int requestId);
        Task RejectAsync(int requestId);
    }

}
