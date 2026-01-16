using var context = new AppDbContext();

var role = new Role
{
    RoleName = "Admin"
};

context.Roles.Add(role);
context.SaveChanges();

Console.WriteLine("Single role inserted");
