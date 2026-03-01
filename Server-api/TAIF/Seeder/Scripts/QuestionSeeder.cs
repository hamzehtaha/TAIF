using System.Text.Json;
using TAIF.API.Seeder;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

public class QuestionSeeder : IEntitySeeder
{
    private readonly TaifDbContext _context;
    private readonly IWebHostEnvironment _env;

    public QuestionSeeder(TaifDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task SeedAsync()
    {
        var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", "Question.seed.json");

        if (!File.Exists(filePath))
            throw new FileNotFoundException($"Seed file not found: {filePath}");

        var json = await File.ReadAllTextAsync(filePath);

        var questions = JsonSerializer.Deserialize<List<QuestionJson>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;

        foreach (var q in questions)
        {
            var org = _context.Organizations
                .FirstOrDefault(o => o.Slug == q.OrganizationSlug);

            if (org == null)
            {
                Console.WriteLine($"⚠ Organization not found: {q.OrganizationSlug}");
                continue;
            }

            if (_context.Set<Question>().Any(x =>
                    x.Info == q.Info &&
                    x.OrganizationId == org.Id))
                continue;

            // 🔥 Resolve Answer IDs from DB
            var answerIds = _context.Set<Answer>()
                .Where(a => q.Answers.Contains(a.Text) &&
                            a.OrganizationId == org.Id)
                .Select(a => a.Id)
                .ToList();

            if (answerIds.Count != q.Answers.Count)
            {
                Console.WriteLine($"⚠ Some answers missing for question: {q.Info}");
                continue;
            }

            // 🔥 Resolve Skill IDs from DB
            var skillIds = _context.Set<Skill>()
                .Where(s => q.Skills.Contains(s.Name) &&
                            s.OrganizationId == org.Id)
                .Select(s => s.Id)
                .ToList();

            _context.Set<Question>().Add(new Question
            {
                Info = q.Info,
                Goals = q.Goals,
                AnswerIds = answerIds,
                CorrectAnswerIndex = q.CorrectAnswerIndex,
                MinPercentage = q.MinPercentage,
                SkillIds = skillIds,
                OrganizationId = org.Id
            });
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("✅ Questions seeded successfully");
    }

    private class QuestionJson
    {
        public string Info { get; set; } = string.Empty;
        public string Goals { get; set; } = string.Empty;
        public List<string> Answers { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
        public int MinPercentage { get; set; }
        public List<string> Skills { get; set; } = new();
        public string OrganizationSlug { get; set; } = string.Empty;
    }
}