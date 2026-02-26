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
        private readonly Random _random = new();

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

            // Get public organization
            var publicOrg = _context.Organizations.FirstOrDefault(o => o.Identity == "default");
            if (publicOrg == null)
            {
                Console.WriteLine("⚠️ Public organization not found. Please seed organizations first.");
                return;
            }

            var instructors = _context.Users
                .Where(u => u.Role == UserRoleType.ContentCreator)
                .ToList();

            if (instructors.Count == 0)
            {
                Console.WriteLine("⚠️ No instructors found. Please seed users first.");
                return;
            }

            // Get all existing courses for random assignment
            var allCourses = _context.Courses
                .Where(c => !c.IsDeleted)
                .Select(c => c.Id)
                .ToList();

            if (allCourses.Count == 0)
            {
                Console.WriteLine("⚠️ No courses found. Please seed courses first.");
                return;
            }

            Console.WriteLine($"📚 Found {allCourses.Count} courses for random assignment");

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
                    DurationInSeconds = 0,
                    OrganizationId = publicOrg.Id
                };

                _context.LearningPaths.Add(learningPath);
                await _context.SaveChangesAsync();

                // Track used courses for this learning path to avoid duplicates
                var usedCourseIds = new HashSet<Guid>();

                foreach (var sectionData in lpData.Sections ?? [])
                {
                    var section = new LearningPathSection
                    {
                        LearningPathId = learningPath.Id,
                        Name = sectionData.Name,
                        Description = sectionData.Description,
                        Order = sectionData.Order,
                        OrganizationId = publicOrg.Id
                    };

                    _context.LearningPathSections.Add(section);
                    await _context.SaveChangesAsync();

                    // Randomly select 1-3 courses for this section
                    var coursesPerSection = _random.Next(1, Math.Min(4, allCourses.Count - usedCourseIds.Count + 1));
                    var availableCourses = allCourses.Where(c => !usedCourseIds.Contains(c)).ToList();
                    
                    if (availableCourses.Count == 0)
                    {
                        // Reset if we've used all courses
                        usedCourseIds.Clear();
                        availableCourses = allCourses.ToList();
                    }

                    var selectedCourses = availableCourses
                        .OrderBy(_ => _random.Next())
                        .Take(coursesPerSection)
                        .ToList();

                    var courseOrder = 1;
                    foreach (var courseId in selectedCourses)
                    {
                        usedCourseIds.Add(courseId);

                        var learningPathCourse = new LearningPathCourse
                        {
                            LearningPathSectionId = section.Id,
                            CourseId = courseId,
                            Order = courseOrder++,
                            IsRequired = _random.Next(100) < 80, // 80% chance of being required
                            OrganizationId = publicOrg.Id
                        };

                        _context.LearningPathCourses.Add(learningPathCourse);
                    }

                    await _context.SaveChangesAsync();
                    Console.WriteLine($"   📖 Section '{sectionData.Name}' - {selectedCourses.Count} courses assigned");
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
        }
    }
}