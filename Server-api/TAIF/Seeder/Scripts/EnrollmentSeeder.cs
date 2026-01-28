using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed Enrollment
    public class EnrollmentSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;

        public EnrollmentSeeder(TaifDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            // 1️ Load real users & courses
            var users = await _context.Users
                .Where(u => !u.IsDeleted)
                .ToListAsync();

            var courses = await _context.Courses
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            if (!users.Any() || !courses.Any())
            {
                Console.WriteLine("No users or courses found. Enrollment skipped.");
                return;
            }

            // 2️ Enroll logic (ALL users → ALL courses)
            foreach (var user in users)
            {
                foreach (var course in courses)
                {
                    var exists = await _context.Enrollments.AnyAsync(e =>
                        e.UserId == user.Id &&
                        e.CourseId == course.Id);

                    if (exists)
                        continue;

                    _context.Enrollments.Add(new Enrollment
                    {
                        UserId = user.Id,
                        CourseId = course.Id
                    });

                    Console.WriteLine($"Enrolled {user.Email} → {course.Name}");
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("Enrollment seeding completed");
        }
    }
}
