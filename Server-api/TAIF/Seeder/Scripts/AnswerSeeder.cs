using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    public class AnswerSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AnswerSeeder(TaifDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedAsync()
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", "Answer.seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);

            var answers = JsonSerializer.Deserialize<List<AnswerJson>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Invalid answer JSON");

            foreach (var answer in answers)
            {
                var org = _context.Organizations
                    .FirstOrDefault(o => o.Slug == answer.OrganizationSlug);

                if (org == null) continue;

                bool exists = _context.Skills.Any(); // just force context load safety

                if (!_context.Set<Answer>().Any(a =>
                        a.Text == answer.Text &&
                        a.OrganizationId == org.Id))
                {
                    _context.Set<Answer>().Add(new Answer
                    {
                        Text = answer.Text,
                        OrganizationId = org.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Answers seeded successfully");
        }

        private class AnswerJson
        {
            public string Text { get; set; } = string.Empty;
            public string OrganizationSlug { get; set; } = string.Empty;
        }
    }
}