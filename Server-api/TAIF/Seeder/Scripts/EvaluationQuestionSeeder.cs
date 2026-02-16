using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed EvaluationQuestion
    public class EvaluationQuestionSeeder : IEntitySeeder
    {
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

            foreach (var q in questions)
            {
                if (!_context.EvaluationQuestions.Any(x => x.Text == q.Text))
                {
                    var question = new EvaluationQuestion
                    {
                        Id = Guid.NewGuid(),
                        Text = q.Text,
                        Order = q.Order
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
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Evaluation Questions seeded successfully");
        }

        private class QuestionJson
        {
            public string Text { get; set; } = null!;
            public int Order { get; set; }
            public List<AnswerJson> Answers { get; set; } = new();
        }

        private class AnswerJson
        {
            public string Text { get; set; } = null!;
            public int Score { get; set; }
        }
    }
}
