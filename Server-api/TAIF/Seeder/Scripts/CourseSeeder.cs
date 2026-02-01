using System.Text.Json;
using System.Text.Json.Serialization;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Course
    public class CourseSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public CourseSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Obsolete]
        public async Task SeedAsync()
        {
            var filePath = Path.Combine(
                _env.ContentRootPath,
                "Seeder",
                "Data",
                "Course.seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException(filePath);

            var json = await File.ReadAllTextAsync(filePath);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };

            var seedData = JsonSerializer.Deserialize<SeedDataJson>(json, options)
                ?? throw new InvalidOperationException("Invalid seed JSON");

            foreach (var categoryData in seedData.Categories)
            {
                var category = _context.Categories.FirstOrDefault(c => c.Name == categoryData.Name);
                if (category == null)
                {
                    category = new Category { Name = categoryData.Name };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }

                foreach (var courseData in categoryData.Courses ?? [])
                {
                    if (_context.Courses.Any(c => c.Name == courseData.Name))
                        continue;

                    var course = new Course
                    {
                        Name = courseData.Name,
                        Description = courseData.Description,
                        Photo = courseData.Photo,
                        CategoryId = category.Id
                    };

                    _context.Courses.Add(course);
                    await _context.SaveChangesAsync();

                    foreach (var lessonData in courseData.Lessons ?? [])
                    {
                        var lesson = new Lesson
                        {
                            Title = lessonData.Title,
                            Photo = lessonData.Photo,
                            Order = lessonData.Order,
                            CourseId = course.Id
                        };

                        _context.lessons.Add(lesson);
                        await _context.SaveChangesAsync();

                        foreach (var itemData in lessonData.LessonItems ?? [])
                        {
                            var lessonItem = new LessonItem
                            {
                                Name = itemData.Name,
                                Type = itemData.Type,
                                LessonId = lesson.Id,
                                Order = itemData.Order,
                                DurationInSeconds = itemData.DurationInSeconds,
                                Content = JsonSerializer.Serialize(itemData.Content)
                            };

                            _context.LessonItems.Add(lessonItem);
                        }

                        await _context.SaveChangesAsync();
                    }
                }
            }

            Console.WriteLine("✅ Courses seeded successfully");
        }

        // ================= JSON MODELS =================

        private class SeedDataJson
        {
            public List<CategoryJson> Categories { get; set; } = new();
        }

        private class CategoryJson
        {
            public string Name { get; set; } = null!;
            public List<CourseJson>? Courses { get; set; }
        }

        private class CourseJson
        {
            public string Name { get; set; } = null!;
            public string Description { get; set; } = null!;
            public string Photo { get; set; } = null!;
            public List<LessonJson>? Lessons { get; set; }
        }

        private class LessonJson
        {
            public string Title { get; set; } = null!;
            public string? Photo { get; set; }
            public int Order { get; set; }
            public List<LessonItemJson>? LessonItems { get; set; }
        }

        private class LessonItemJson
        {
            public string Name { get; set; } = null!;
            public LessonItemType Type { get; set; }
            public JsonElement Content { get; set; }
            public double DurationInSeconds { get; set; }
            public int Order { get; set; }
        }
    }
}
