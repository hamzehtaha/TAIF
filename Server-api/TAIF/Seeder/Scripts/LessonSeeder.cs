using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Infrastructure.Data;
using TAIF.Domain.Entities;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed lesson
    public class LessonSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public LessonSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            string seedName = "lesson";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
            var lessons = JsonSerializer.Deserialize<List<lessonJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid lesson JSON");

            foreach (var lesson in lessons)
            {
                if (!_context.lessons.Any(f => f.Title == lesson.Title))
                {
                    var newlesson = new Domain.Entities.Lesson
                    {
                        Title = lesson.Title,
                        URL = lesson.URL,
                        CourseId = lesson.CourseId,
                        Photo = lesson.Photo
                    };
                    _context.lessons.Add(newlesson);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ lessons seeded successfully");
        }

        private class lessonJson : Base
        {
            public string Title { get; set; } = null!;
            public string URL { get; set; } = null!;
            public Guid CourseId { get; set; }
            public string Photo { get; set; } = null!;
        }
    }
}
