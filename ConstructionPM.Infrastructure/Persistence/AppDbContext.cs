using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionPM.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        private readonly ICurrentUserService? _currentUser;

        public AppDbContext(
            DbContextOptions<AppDbContext> options,
            ICurrentUserService? currentUser)
            : base(options)
        {
            _currentUser = currentUser;
        }

        // =========================
        // DbSets
        // =========================
        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<Document> Documents => Set<Document>();
        public DbSet<ProjectStatusHistory> ProjectStatusHistory =>
            Set<ProjectStatusHistory>();
        public DbSet<RegistrationRequest> RegistrationRequests =>
            Set<RegistrationRequest>();




        // =========================
        // SaveChanges Overrides
        // =========================
        public override int SaveChanges()
        {
            ApplyAuditInfo();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            ApplyAuditInfo();
            return await base.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // Audit Logic (Centralized)
        // =========================
        private void ApplyAuditInfo()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            var userId = _currentUser?.UserId > 0 ? _currentUser.UserId : null;
            var userName = !string.IsNullOrWhiteSpace(_currentUser?.UserName)
                ? _currentUser!.UserName
                : "System";

            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.CreatedByUserId = userId;
                        entry.Entity.CreatedByUserName = userName;
                        entry.Entity.IsDeleted = false;
                        break;

                    case EntityState.Modified:
                        // Protect Created fields
                        entry.Property(x => x.CreatedAt).IsModified = false;
                        entry.Property(x => x.CreatedByUserId).IsModified = false;
                        entry.Property(x => x.CreatedByUserName).IsModified = false;

                        entry.Entity.ModifiedAt = DateTime.UtcNow;
                        entry.Entity.ModifiedByUserId = userId;
                        entry.Entity.ModifiedByUserName = userName;
                        break;

                    case EntityState.Deleted:
                        // Soft delete
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedAt = DateTime.UtcNow;
                        entry.Entity.DeletedByUserId = userId;
                        entry.Entity.DeletedByUserName = userName;
                        break;
                }
            }
        }

        // =========================
        // Model Configuration
        // =========================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Global soft delete filter
            modelBuilder.Entity<User>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Project>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<TaskItem>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Document>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<ProjectStatusHistory>().HasQueryFilter(x => !x.IsDeleted);

            base.OnModelCreating(modelBuilder);
        }
    }
}
