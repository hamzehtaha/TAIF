using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed EvaluationQuestion
    public class EvaluationQuestionSeeder : IEntitySeeder
    {
        // Test: questions reference skills that must be seeded first
        public SeedCategory Category => SeedCategory.Test;

        private readonly TaifDbContext _context;
        private readonly IWebHostEnvironment _env;

        public EvaluationQuestionSeeder(TaifDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedAsync()
        {
            string seedName = "EvaluationQuestion";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);

            var questions = JsonSerializer.Deserialize<List<QuestionJson>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Invalid evaluation question JSON");

            // Build skill name → ID lookup (ignore tenant filter since skills are org-scoped)
            var skillMap = await _context.Skills
                .IgnoreQueryFilters()
                .Where(s => !s.IsDeleted)
                .ToDictionaryAsync(s => s.Name, s => s.Id, StringComparer.OrdinalIgnoreCase);

            foreach (var q in questions)
            {
                if (_context.EvaluationQuestions.Any(x => x.Text == q.Text))
                    continue;

                var skillIds = q.SkillNames
                    .Select(name =>
                    {
                        if (skillMap.TryGetValue(name, out var id)) return (Guid?)id;
                        Console.WriteLine($"⚠️  Skill '{name}' not found — skipping for question: {q.Text}");
                        return null;
                    })
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .ToList();

                var question = new EvaluationQuestion
                {
                    Id = Guid.NewGuid(),
                    Text = q.Text,
                    SkillIds = skillIds
                };

                foreach (var a in q.Answers)
                {
                    question.Answers.Add(new EvaluationAnswer
                    {
                        Id = Guid.NewGuid(),
                        Text = a.Text,
                        Score = a.Score
                    });
                }

                _context.EvaluationQuestions.Add(question);
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Evaluation Questions seeded successfully");
        }

        private class QuestionJson
        {
            public string Text { get; set; } = null!;
            public List<string> SkillNames { get; set; } = new();
            public List<AnswerJson> Answers { get; set; } = new();
        }

        private class AnswerJson
        {
            public string Text { get; set; } = null!;
            public int Score { get; set; }
        }
    }
}
