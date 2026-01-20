using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionPM.Infrastructure.Repositories.Commands
{
    public class ProjectCommandRepository : IProjectCommandRepository
    {
        private readonly AppDbContext _context;

        public ProjectCommandRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<bool> ExistsByNameAsync(string name)
        {
            var normalizedName = name.Trim().ToLower();

            return await _context.Projects
                .AsNoTracking()
                .AnyAsync(p => p.ProjectName.ToLower() == normalizedName);
        }
    }
}
