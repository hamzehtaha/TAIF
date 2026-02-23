using System.Text.Json;
using System.Text.Json.Serialization;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    public class LearningPathSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _env;

        [Obsolete]
        public LearningPathSeeder(TaifDbContext context, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
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
                "LearningPath.seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };

            var learningPaths = JsonSerializer.Deserialize<List<LearningPathJson>>(json, options)
                ?? throw new InvalidOperationException("Invalid LearningPath JSON");

            var instructors = _context.Users
                .Where(u => u.Role == UserRoleType.ContentCreator)
                .ToList();

            if (instructors.Count == 0)
            {
                Console.WriteLine("No instructors found. Please seed users first.");
                return;
            }

            var courseNameToId = _context.Courses
                .Where(c => !c.IsDeleted)
                .ToDictionary(c => c.Name!, c => c.Id, StringComparer.OrdinalIgnoreCase);

            var instructorIndex = 0;

            foreach (var lpData in learningPaths)
            {
                if (_context.LearningPaths.Any(lp => lp.Name == lpData.Name))
                {
                    Console.WriteLine($"Learning path '{lpData.Name}' already exists, skipping...");
                    continue;
                }

                var instructor = instructors[instructorIndex % instructors.Count];
                instructorIndex++;

                var learningPath = new LearningPath
                {
                    Name = lpData.Name,
                    Description = lpData.Description,
                    Photo = lpData.Photo,
                    CreatorId = instructor.Id,
                    TotalEnrolled = 0,
                    DurationInSeconds = 0
                };

                _context.LearningPaths.Add(learningPath);
                await _context.SaveChangesAsync();

                foreach (var sectionData in lpData.Sections ?? [])
                {
                    var section = new LearningPathSection
                    {
                        LearningPathId = learningPath.Id,
                        Name = sectionData.Name,
                        Description = sectionData.Description,
                        Order = sectionData.Order
                    };

                    _context.LearningPathSections.Add(section);
                    await _context.SaveChangesAsync();

                    foreach (var courseRef in sectionData.Courses ?? [])
                    {
                        if (!courseNameToId.TryGetValue(courseRef.CourseName, out var courseId))
                        {
                            Console.WriteLine($"Course '{courseRef.CourseName}' not found for section '{sectionData.Name}'");
                            continue;
                        }

                        var learningPathCourse = new LearningPathCourse
                        {
                            LearningPathSectionId = section.Id,
                            CourseId = courseId,
                            Order = courseRef.Order,
                            IsRequired = courseRef.IsRequired
                        };

                        _context.LearningPathCourses.Add(learningPathCourse);
                    }

                    await _context.SaveChangesAsync();
                }

                Console.WriteLine($"✅ Learning path '{lpData.Name}' seeded with {lpData.Sections?.Count ?? 0} sections");
            }

            Console.WriteLine("✅ Learning paths seeded successfully");
        }

        private class LearningPathJson
        {
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public string? Photo { get; set; }
            public List<LearningPathSectionJson>? Sections { get; set; }
        }

        private class LearningPathSectionJson
        {
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public int Order { get; set; }
            public List<LearningPathCourseReferenceJson>? Courses { get; set; }
        }

        private class LearningPathCourseReferenceJson
        {
            public string CourseName { get; set; } = null!;
            public int Order { get; set; }
            public bool IsRequired { get; set; } = true;
        }
    }
}