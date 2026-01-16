using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Role> Roles => Set<Role>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlServer(
            "Server=(localdb)\\MSSQLLocalDB;Database=EfCoreConsoleDb;Trusted_Connection=True;TrustServerCertificate=True");
    }
}
