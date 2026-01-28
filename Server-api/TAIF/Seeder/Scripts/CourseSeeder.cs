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
            string seedName = "Course";
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", seedName + ".seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

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
                // Create or get category
                var category = _context.Categories.FirstOrDefault(c => c.Name == categoryData.Name);
                if (category == null)
                {
                    category = new Category
                    {
                        Name = categoryData.Name
                    };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ Category '{category.Name}' created");
                }

                // Process courses for this category
                if (categoryData.Courses != null && categoryData.Courses.Any())
                {
                    foreach (var courseData in categoryData.Courses)
                    {
                        if (!_context.Courses.Any(c => c.Name == courseData.Name))
                        {
                            var newCourse = new Course
                            {
                                Name = courseData.Name,
                                Description = courseData.Description,
                                Photo = courseData.Photo,
                                CategoryId = category.Id
                            };
                            _context.Courses.Add(newCourse);
                            await _context.SaveChangesAsync();

                            // Process lessons for this course
                            if (courseData.Lessons != null && courseData.Lessons.Any())
                            {
                                foreach (var lessonData in courseData.Lessons)
                                {
                                    var newLesson = new Lesson
                                    {
                                        Title = lessonData.Title,
                                        CourseId = newCourse.Id,
                                        Photo = lessonData.Photo
                                    };
                                    _context.lessons.Add(newLesson);
                                    await _context.SaveChangesAsync();

                                    // Process lesson items for this lesson
                                    if (lessonData.LessonItems != null && lessonData.LessonItems.Any())
                                    {
                                        foreach (var itemData in lessonData.LessonItems)
                                        {
                                            var newLessonItem = new LessonItem
                                            {
                                                Name = itemData.Name,
                                                URL = itemData.URL,
                                                Content = itemData.Content,
                                                Type = itemData.Type,
                                                LessonId = newLesson.Id,
                                                DurationInSeconds = itemData.DurationInSeconds,
                                            };
                                            _context.LessonItems.Add(newLessonItem);
                                        }
                                    }
                                }
                                await _context.SaveChangesAsync();
                            }

                            Console.WriteLine($"✅ Course '{newCourse.Name}' with {courseData.Lessons?.Count ?? 0} lessons seeded successfully");
                        }
                    }
                }
            }

            Console.WriteLine("✅ All categories, courses, lessons, and lesson items seeded successfully");
        }

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
            public List<LessonItemJson>? LessonItems { get; set; }
        }

        private class LessonItemJson
        {
            public string Name { get; set; } = null!;
            public string URL { get; set; } = null!;
            public string Content { get; set; } = null!;
            public LessonItemType Type { get; set; }
            public double DurationInSeconds { get; set; }
        }
    }
}
