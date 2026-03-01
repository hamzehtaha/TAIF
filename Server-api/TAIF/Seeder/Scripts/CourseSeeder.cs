using System.Text.Json;
using System.Text.Json.Serialization;
using TAIF.Domain.Entities;
using TAIF.Domain.Interfaces;
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

            // PropertyNameCaseInsensitive lets the JSON use PascalCase wrapper fields
            // while [JsonPropertyName] camelCase attributes on entities are respected
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };

            var seedData = JsonSerializer.Deserialize<SeedDataJson>(json, options)
                ?? throw new InvalidOperationException("Invalid seed JSON");

            var tagNameToId = _context.Tags.ToDictionary(t => t.Name, t => t.Id, StringComparer.OrdinalIgnoreCase);
            var publicOrg   = _context.Organizations.FirstOrDefault(o => o.Identity == "default");

            var contentCreators = _context.Users
                .Where(u => u.Role == UserRoleType.ContentCreator)
                .ToList();

            if (contentCreators.Count == 0)
            {
                Console.WriteLine("⚠️ No content creators found. Please seed users first.");
                return;
            }

            var instructors = _context.Instructors.ToList();
            if (instructors.Count == 0)
            {
                Console.WriteLine("⚠️ No instructors found. Please seed instructors first.");
                return;
            }

            var creatorIndex    = 0;
            var instructorIndex = 0;

            foreach (var categoryData in seedData.Categories)
            {
                var category = _context.Categories.FirstOrDefault(c => c.Name == categoryData.Name);
                if (category == null)
                {
                    category = new Category { Name = categoryData.Name, OrganizationId = publicOrg?.Id };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }

                foreach (var courseData in categoryData.Courses ?? [])
                {
                    if (_context.Courses.Any(c => c.Name == courseData.Name))
                        continue;

                    var tagIds = new List<Guid>();
                    foreach (var tagName in courseData.Tags ?? [])
                    {
                        if (tagNameToId.TryGetValue(tagName, out var tagId))
                            tagIds.Add(tagId);
                        else
                            Console.WriteLine($"⚠️ Tag '{tagName}' not found for course '{courseData.Name}'");
                    }

                    var creator = contentCreators[creatorIndex % contentCreators.Count];
                    creatorIndex++;

                    var course = new Course
                    {
                        Name          = courseData.Name,
                        Description   = courseData.Description,
                        Photo         = courseData.Photo,
                        CategoryId    = category.Id,
                        Tags          = tagIds,
                        Status        = CourseStatus.Published,
                        CreatedBy     = creator.Id,
                        OrganizationId = publicOrg?.Id
                    };

                    _context.Courses.Add(course);
                    await _context.SaveChangesAsync();

                    var lessonOrder = 1;
                    foreach (var lessonData in courseData.Lessons ?? [])
                    {
                        var instructor = instructors[instructorIndex % instructors.Count];
                        instructorIndex++;

                        var lesson = new Lesson
                        {
                            Title          = lessonData.Title,
                            Photo          = lessonData.Photo,
                            Description    = lessonData.Description,
                            CreatedBy      = creator.Id,
                            OrganizationId = publicOrg?.Id,
                            InstructorId   = instructor.Id
                        };

                        _context.lessons.Add(lesson);
                        await _context.SaveChangesAsync();

                        _context.CourseLessons.Add(new CourseLesson
                        {
                            CourseId       = course.Id,
                            LessonId       = lesson.Id,
                            Order          = lessonData.Order > 0 ? lessonData.Order : lessonOrder++,
                            OrganizationId = publicOrg?.Id
                        });
                        await _context.SaveChangesAsync();

                        var itemOrder = 1;
                        foreach (var itemData in lessonData.LessonItems ?? [])
                        {
                            // JSON now matches entity property names exactly —
                            // deserialize directly into the entity type, no mapping needed.
                            IContentData contentData = itemData.Type switch
                            {
                                LessonItemType.Video    => itemData.Content.Deserialize<Video>(options)
                                                           ?? throw new InvalidOperationException($"Invalid Video content for '{itemData.Name}'"),
                                LessonItemType.RichText => itemData.Content.Deserialize<RichText>(options)
                                                           ?? throw new InvalidOperationException($"Invalid RichText content for '{itemData.Name}'"),
                                LessonItemType.Quiz     => itemData.Content.Deserialize<Quiz>(options)
                                                           ?? throw new InvalidOperationException($"Invalid Quiz content for '{itemData.Name}'"),
                                _ => throw new InvalidOperationException($"Unknown content type: {itemData.Type}")
                            };

                            var content = new Content(itemData.Type, contentData)
                            {
                                OrganizationId = publicOrg?.Id
                            };
                            _context.Contents.Add(content);
                            await _context.SaveChangesAsync();

                            var lessonItem = new LessonItem
                            {
                                Name              = itemData.Name,
                                Type              = itemData.Type,
                                DurationInSeconds = itemData.DurationInSeconds,
                                ContentId         = content.Id,
                                OrganizationId    = publicOrg?.Id
                            };
                            _context.LessonItems.Add(lessonItem);
                            await _context.SaveChangesAsync();

                            _context.LessonLessonItems.Add(new LessonLessonItem
                            {
                                LessonId       = lesson.Id,
                                LessonItemId   = lessonItem.Id,
                                Order          = itemData.Order > 0 ? itemData.Order : itemOrder++,
                                OrganizationId = publicOrg?.Id
                            });
                        }

                        await _context.SaveChangesAsync();
                    }
                }
            }

            Console.WriteLine("✅ Courses seeded successfully");
        }

        // ================= SEED WRAPPER MODELS =================
        // Only represent the Course.seed.json structure (categories/courses/lessons/items).
        // Content is deserialized directly into entity types (Video, RichText, Quiz).

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
            public List<string>? Tags { get; set; }
            public List<LessonJson>? Lessons { get; set; }
        }

        private class LessonJson
        {
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string? Photo { get; set; }
            public int Order { get; set; }
            public List<LessonItemJson>? LessonItems { get; set; }
        }

        private class LessonItemJson
        {
            public string Name { get; set; } = null!;
            public LessonItemType Type { get; set; }
            public JsonElement Content { get; set; }   // deserialized directly into Video / RichText / Quiz
            public double DurationInSeconds { get; set; }
            public int Order { get; set; }
        }
    }
}
