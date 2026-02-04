using ConstructionPM.Domain.Entities.ConstructionPM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Application.Interfaces.Repositories
{
    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(int id);

        Task<List<Comment>> GetByTaskIdAsync(int taskId);
    }

}
