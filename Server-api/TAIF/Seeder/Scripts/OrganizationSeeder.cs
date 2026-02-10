using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Organization
    public class OrganizationSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public OrganizationSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            string seedName = "Organization";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var organizations = JsonSerializer.Deserialize<List<OrganizationJson>>(json, options)
                               ?? throw new InvalidOperationException("Invalid organization JSON");

            foreach (var org in organizations)
            {
                if (!_context.Organizations.Any(o => o.Name == org.Name))
                {
                    var newOrg = new Organization
                    {
                        Id = org.Id,
                        Name = org.Name,
                        Logo = org.Logo,
                        Description = org.Description,
                        Email = org.Email,
                        Phone = org.Phone,
                        IsActive = org.IsActive
                    };
                    _context.Organizations.Add(newOrg);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Organizations seeded successfully");
        }

        private class OrganizationJson
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = null!;
            public string? Logo { get; set; }
            public string? Description { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public bool IsActive { get; set; } = true;
        }
    }
}