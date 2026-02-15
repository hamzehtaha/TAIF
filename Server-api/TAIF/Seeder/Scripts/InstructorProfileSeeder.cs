using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed InstructorProfile
    public class InstructorProfileSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public InstructorProfileSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            // Get default (Public) Organization for assigning to instructor profiles
            var publicOrg = _context.Organizations.FirstOrDefault(o => o.Identity == "default");
            
            string seedName = "InstructorProfile";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var profiles = JsonSerializer.Deserialize<List<InstructorProfileJson>>(json, options)
                          ?? throw new InvalidOperationException("Invalid instructor profile JSON");

            foreach (var profile in profiles)
            {
                if (!_context.InstructorProfiles.Any(ip => ip.UserId == profile.UserId))
                {
                    var newProfile = new InstructorProfile
                    {
                        UserId = profile.UserId,
                        OrganizationId = profile.OrganizationId ?? publicOrg?.Id,
                        YearsOfExperience = profile.YearsOfExperience,
                        Rating = profile.Rating,
                        CoursesCount = profile.CoursesCount
                    };
                    _context.InstructorProfiles.Add(newProfile);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Instructor Profiles seeded successfully");
        }

        private class InstructorProfileJson
        {
            public Guid UserId { get; set; }
            public Guid? OrganizationId { get; set; }
            public string? WebsiteUrl { get; set; }
            public int YearsOfExperience { get; set; }
            public decimal Rating { get; set; }
            public int CoursesCount { get; set; }
        }
    }
}