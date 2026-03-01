using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Skill
    public class SkillSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SkillSeeder(TaifDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedAsync()
        {
            string seedName = "Skill";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var skills = JsonSerializer.Deserialize<List<SkillJson>>(json, options)
                         ?? throw new InvalidOperationException("Invalid skill JSON");

            foreach (var skill in skills)
            {
                var organization = _context.Organizations
                    .FirstOrDefault(o => o.Slug == skill.OrganizationSlug);

                if (organization == null)
                {
                    Console.WriteLine($"Organization not found for slug: {skill.OrganizationSlug}");
                    continue;
                }

                bool exists = _context.Skills.Any(s =>
                    s.Name == skill.Name &&
                    s.OrganizationId == organization.Id);

                if (!exists)
                {
                    var newSkill = new Skill
                    {
                        Name = skill.Name,
                        Description = skill.Description,
                        OrganizationId = organization.Id,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Skills.Add(newSkill);
                }
            }

            await _context.SaveChangesAsync();

            Console.WriteLine("Skills seeded successfully");
        }

        private class SkillJson
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string OrganizationSlug { get; set; } = string.Empty;
        }
    }
}