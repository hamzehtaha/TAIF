using System.Text.Json.Serialization;
using System.Text.Json;
using TAIF.Infrastructure.Data;

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
            var courses = JsonSerializer.Deserialize<List<CourseJson>>(json, options)
                       ?? throw new InvalidOperationException("Invalid course JSON");

            foreach (var course in courses)
            {
                if (!_context.Courses.Any(f => f.Name == course.Name))
                {
                    var newCourse = new Domain.Entities.Course
                    {
                        Name = course.Name,
                        Description = course.Description,
                        Photo = course.Photo
                    };
                    _context.Courses.Add(newCourse);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Courses seeded successfully");
        }

        private class CourseJson
        {
            public string Name { get; set; } = null!;
            public string Description { get; set; } = null!;
            public string Photo { get; set; } = null!;
        }
    }
}
