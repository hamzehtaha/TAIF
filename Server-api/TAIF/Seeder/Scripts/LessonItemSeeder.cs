using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Infrastructure.Data;
using TAIF.Domain.Entities;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed lessonItem
    public class LessonItemSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public LessonItemSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            string seedName = "lessonItem";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var lessonItems = JsonSerializer.Deserialize<List<lessonItemJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid lesson Item JSON");

            foreach (var lessonItem in lessonItems)
            {
                if (!_context.LessonItems.Any(f => f.Name == lessonItem.Name))
                {
                    var newlessonItem = new Domain.Entities.LessonItem
                    {
                        Name = lessonItem.Name,
                        URL = lessonItem.URL,
                        Content = lessonItem.Content,
                        Type = lessonItem.Type,
                        LessonId = lessonItem.LessonId
                    };
                    _context.LessonItems.Add(newlessonItem);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ lessonItems seeded successfully");
        }

        private class lessonItemJson : Base
        {
            public string Name { get; set; } = null!;
            public string URL { get; set; } = null!;
            public string Content { get; set; } = null!;
            public int Type { get; set; }
            public Guid LessonId { get; set; }
        }
    }
}
