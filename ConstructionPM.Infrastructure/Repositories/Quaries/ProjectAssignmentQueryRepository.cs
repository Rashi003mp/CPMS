using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Domain.Enums;
using ConstructionPM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionPM.Infrastructure.Repositories.Quaries
{
    public class ProjectAssignmentQueryRepository : IProjectAssignmentQueryRepository
    {
        private readonly AppDbContext _db;
        public ProjectAssignmentQueryRepository(AppDbContext db)
        {
            _db = db;
        }
        public async Task<int> GetUserProjectCountAsync(int userId)
        {
            return await _db.ProjectUsers.CountAsync(pa => pa.AssignedUserId == userId && !pa.IsDeleted);
        }

        public async Task<bool> IsUserAlreadyAssignedAsync(int projectId, int userId)
        {
            return await _db.ProjectUsers
                    .AsNoTracking()
                    .AnyAsync(x =>
            x.ProjectId == projectId &&
            x.AssignedUserId == userId &&
            !x.IsDeleted
        );
        }

        public async Task<bool> IsRoleAlreadyAssignedInProjectAsync(
    int projectId,
    Role role)
        {
            return await _db.ProjectUsers
                .AsNoTracking()
                .AnyAsync(x =>
                    x.ProjectId == projectId &&
                    x.RoleId == role &&
                    !x.IsDeleted
                );
        }

    }
}
