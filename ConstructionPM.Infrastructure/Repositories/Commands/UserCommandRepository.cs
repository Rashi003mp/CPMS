using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionPM.Infrastructure.Repositories.Commands;

public class UserCommandRepository : IUserCommandRepository
{
    private readonly AppDbContext _context;

    public UserCommandRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user.Id;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }
    public async Task<bool> ExistsByEmailAsync(string? email)
    {
        return await _context.Users
        .AsNoTracking()
        .AnyAsync(u => u.Email == email && !u.IsDeleted);
    }

    public async Task<bool> RegistrationRequestExistsAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();

        return await _context.RegistrationRequests
            .AsNoTracking()
            .AnyAsync(r =>
                r.Email.ToLower() == normalizedEmail &&
                r.Status == "Pending" &&
                !r.IsDeleted
            );
    }


}
