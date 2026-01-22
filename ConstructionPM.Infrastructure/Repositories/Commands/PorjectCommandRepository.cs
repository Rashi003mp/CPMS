using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Domain.Enums;
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

        public async Task AddAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            var normalizedName = name.Trim().ToLower();

            return await _context.Projects
                .AsNoTracking()
                .AnyAsync(p => p.ProjectName.ToLower() == normalizedName);
        }

        public async Task UpdateAsync(Guid projectId, ProjectStatus status)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) throw new Exception("Project not found.");

            project.Status = status;

        }
    }
}
