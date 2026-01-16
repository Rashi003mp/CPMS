using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Persistence;

namespace ConstructionPM.Infrastructure.Repositories.Commands
{
    public class RegistrationCommandRepository : IRegistrationCommandRepository
    {
        private readonly AppDbContext _context;

        public RegistrationCommandRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(RegistrationRequest request)
        {
            request.CreatedAt = DateTime.UtcNow;
            request.IsDeleted = false;

            _context.RegistrationRequests.Add(request);
            await _context.SaveChangesAsync();

            return request.Id;
        }

        public async Task<int> UpdateAsync(RegistrationRequest request)
        {
            _context.RegistrationRequests.Update(request);
            await _context.SaveChangesAsync();
            
            return request.Id;
        }
    }

}
