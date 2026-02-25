using System.Text.Json;
using System.Text.Json.Serialization;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Instructor
    public class InstructorSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public InstructorSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            // Get default (Public) Organization for assigning to instructors
            var publicOrg = _context.Organizations.FirstOrDefault(o => o.Identity == "default");

            string seedName = "Instructor";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var instructors = JsonSerializer.Deserialize<List<InstructorJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid instructor JSON");

            foreach (var instructor in instructors)
            {
                // Check by name to avoid duplicates
                if (!_context.Instructors.Any(i => i.FirstName == instructor.FirstName && i.LastName == instructor.LastName))
                {
                    var newInstructor = new Instructor
                    {
                        FirstName = instructor.FirstName,
                        LastName = instructor.LastName,
                        Bio = instructor.Bio,
                        Expertises = instructor.Expertises ?? new List<string>(),
                        YearsOfExperience = instructor.YearsOfExperience,
                        OrganizationId = publicOrg?.Id
                    };
                    _context.Instructors.Add(newInstructor);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Instructors seeded successfully");
        }

        private class InstructorJson
        {
            public string FirstName { get; set; } = null!;
            public string LastName { get; set; } = null!;
            public string? Bio { get; set; }
            public List<string>? Expertises { get; set; }
            public int YearsOfExperience { get; set; }
        }
    }
}
