using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Infrastructure.Persistence;
using ConstructionPM.Domain.Entities;

namespace ConstructionPM.Infrastructure.Repositories.Commands
{
    public class RoleCommandRepository : IRoleCommandRepository
    {
        private readonly AppDbContext _context;

        public RoleCommandRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(Role role)
        {
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role.Id;
        }
    }
}
