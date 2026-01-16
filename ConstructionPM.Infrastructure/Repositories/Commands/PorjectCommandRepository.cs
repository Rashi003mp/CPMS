using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Infrastructure.Persistence;

using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Infrastructure.Repositories.Commands
{
    public class ProjectCommandRepository : IProjectCommandRepository
    {
        private readonly AppDbContext _context;

        public ProjectCommandRepository(AppDbContext context)
        {
            _context = context;
        }

    public async Task CreateAsync(Project project)
        {
            _context.Projects.Add(project);
            await  _context.SaveChangesAsync();
        }

    public async Task UpdateAsync(Project project)
        {
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
        }

    }
}
