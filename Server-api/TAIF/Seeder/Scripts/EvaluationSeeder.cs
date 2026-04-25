using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Domain.Models;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Evaluation
    // Depends on: RecommendationSeeder (interests), EvaluationQuestionSeeder (questions)
    public class EvaluationSeeder : IEntitySeeder
    {
        // Test: wires evaluations to interests — requires questions and interests to exist first
        public SeedCategory Category => SeedCategory.Test;

        private readonly TaifDbContext _context;
        private readonly IWebHostEnvironment _env;

        public EvaluationSeeder(TaifDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedAsync()
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", "Evaluation.seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var seedData = JsonSerializer.Deserialize<List<EvaluationJson>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Invalid Evaluation seed JSON");

            // Build lookup maps
            var interestMap = await _context.Interests
                .IgnoreQueryFilters()
                .Where(i => !i.IsDeleted)
                .ToDictionaryAsync(i => i.Name, i => i.Id, StringComparer.OrdinalIgnoreCase);

            var questionMap = await _context.EvaluationQuestions
                .Where(q => !q.IsDeleted)
                .ToDictionaryAsync(q => q.Text, q => q.Id, StringComparer.OrdinalIgnoreCase);

            foreach (var item in seedData)
            {
                if (_context.Evaluations.IgnoreQueryFilters().Any(e => e.Name == item.Name))
                {
                    Console.WriteLine($"⏭️  Evaluation '{item.Name}' already exists, skipping");
                    continue;
                }

                if (!interestMap.TryGetValue(item.InterestName, out var interestId))
                {
                    Console.WriteLine($"⚠️  Interest '{item.InterestName}' not found — skipping evaluation '{item.Name}'");
                    continue;
                }

                var evaluationId = Guid.NewGuid();
                var mappings = new List<EvaluationQuestionMapping>();
                var order = 1;

                foreach (var questionText in item.QuestionTexts)
                {
                    if (!questionMap.TryGetValue(questionText, out var questionId))
                    {
                        Console.WriteLine($"⚠️  Question not found: '{questionText}' — skipping");
                        continue;
                    }

                    mappings.Add(new EvaluationQuestionMapping
                    {
                        QuestionId = questionId,
                        EvaluationId = evaluationId,
                        Order = order++,
                        OrganizationId = null  // Global — visible to all tenants via IgnoreQueryFilters
                    });
                }

                if (mappings.Count == 0)
                {
                    Console.WriteLine($"⚠️  No valid questions found for evaluation '{item.Name}', skipping");
                    continue;
                }

                var evaluation = new Evaluation
                {
                    Id = evaluationId,
                    Name = item.Name,
                    Description = item.Description,
                    InterestId = interestId,
                    OrganizationId = null,  // Global — created as SuperAdmin resource
                    QuestionMappings = mappings
                };

                _context.Evaluations.Add(evaluation);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Evaluation '{item.Name}' created with {mappings.Count} questions");
            }

            Console.WriteLine("✅ Evaluation seeding complete");
        }

        private class EvaluationJson
        {
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public string InterestName { get; set; } = null!;
            public List<string> QuestionTexts { get; set; } = new();
        }
    }
}
