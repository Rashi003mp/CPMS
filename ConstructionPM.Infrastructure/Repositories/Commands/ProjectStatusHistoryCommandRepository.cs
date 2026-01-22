using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Persistence;

namespace ConstructionPM.Infrastructure.Repositories.Commands
{
    public class ProjectStatusHistoryCommandRepository : IProjectStatusHistoryCommandRepository
    {
        private readonly AppDbContext _context;
        public ProjectStatusHistoryCommandRepository( AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(ProjectStatusHistory history)
        {
            _context.ProjectStatusHistory.Add(history);
            await Task.CompletedTask;
        }
    }
}
