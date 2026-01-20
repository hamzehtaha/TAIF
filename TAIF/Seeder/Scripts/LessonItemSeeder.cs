using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed LessonItem
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
            string seedName = "LessonItem";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var lesonItems = JsonSerializer.Deserialize<List<LessonItemJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid lesson item JSON");

            foreach (var lessonItem in lesonItems)
            {
                if (!_context.LessonItems.Any(f => f.Title == lessonItem.Title))
                {
                    var newLessonItem = new Domain.Entities.LessonItem
                    {
                        Title = lessonItem.Title,
                        URL = lessonItem.URL,
                        LessonType = lessonItem.LessonType,
                        CourseId = lessonItem.CourseId
                    };
                    _context.LessonItems.Add(newLessonItem);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ LessonItems seeded successfully");
        }

        private class LessonItemJson
        {
            public string Title { get; set; } = null!;
            public string URL { get; set; } = null!;
            public int LessonType { get; set; }
            public int CourseId { get; set; }
        }
    }
}
