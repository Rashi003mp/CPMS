using ConstructionPM.Application.Interfaces.Repositories;
using ConstructionPM.Domain.Entities.ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Infrastructure.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;

        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

       

        public async Task<Comment?> GetByIdAsync(int id)
        {
            return await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<List<Comment>> GetByTaskIdAsync(int taskId)
        {
            return await _context.Comments
                .AsNoTracking()
                .Where(c => c.TaskId == taskId && !c.IsDeleted)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }
    }

}
