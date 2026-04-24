using TAIF.Application.Services;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed SuperAdmin
    // Production: guarantees at least one SuperAdmin account exists in every environment.
    // Credentials:  super@taif.com / 123
    public class SuperAdminSeeder : IEntitySeeder
    {
        public SeedCategory Category => SeedCategory.Production;

        private readonly TaifDbContext _context;

        public SuperAdminSeeder(TaifDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            const string email = "super@taif.com";

            if (_context.Users.Any(u => u.Email == email))
            {
                Console.WriteLine("SuperAdminSeeder: superadmin already exists, skipping.");
                return;
            }

            var superAdmin = new User
            {
                FirstName = "Super",
                LastName = "Admin",
                Email = email,
                Role = UserRoleType.SuperAdmin,
                IsActive = true,
                IsCompleted = true,
                EmailVerified = true,
                OrganizationId = null, // SuperAdmin is system-wide, not bound to any org
                Birthday = new DateOnly(1990, 1, 1),
                PasswordHash = PasswordHelper.Hash("123"),
            };

            _context.Users.Add(superAdmin);
            await _context.SaveChangesAsync();
            Console.WriteLine("✅ SuperAdmin seeded successfully (super@taif.com)");
        }
    }
}
