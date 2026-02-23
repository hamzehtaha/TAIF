using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed User
    public class UserSeeder: IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public UserSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            // Get default (Public) Organization for assigning to users
            var publicOrg = _context.Organizations.FirstOrDefault(o => o.Identity == "default");
            
            string seedName = "User";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var users = JsonSerializer.Deserialize<List<UserJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid user JSON");

            foreach (var user in users)
            {
                if (!_context.Users.Any(f => f.Email == user.Email))
                {
                    // SuperAdmin has no OrganizationId, all others get Public Org
                    Guid? organizationId = user.Role == UserRoleType.SuperAdmin ? null : publicOrg?.Id;
                    
                    var newUser = new User
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        IsActive = true,
                        Role = user.Role,
                        OrganizationId = organizationId,
                        Birthday = DateOnly.FromDateTime(DateTime.Now),
                        IsCompleted = user.Role == UserRoleType.SuperAdmin || user.Role == UserRoleType.Student,
                        // password = 123
                        PasswordHash = "pmWkWSBCL51Bfkhn79xPuKBKHz//H6B+mY6G9/eieuM=",
                    };
                    _context.Users.Add(newUser);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Users seeded successfully");
        }

        private class UserJson
        {
            public Guid Id { get; set; }
            public string FirstName { get; set; } = null!;
            public string LastName { get; set; } = null!;
            public string Email { get; set; } = null!;
            public UserRoleType Role { get; set; } = UserRoleType.Student;
        }
    }
}
