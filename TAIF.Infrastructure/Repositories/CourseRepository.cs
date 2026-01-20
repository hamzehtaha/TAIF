using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces;

namespace TAIF.Infrastructure.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly TaifDbContext _context;

        public CourseRepository(TaifDbContext context)
        {
            _context = context;
        }

        public async Task<List<Course>> GetAllAsync()
        {
            return await _context.Courses.ToListAsync();
        }

        public async Task<Course?> GetByIdAsync(int id)
        {
            return await _context.Courses.FindAsync(id);
        }

        public async Task<Course> AddAsync(Course course)
        {
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return course;
        }

        public async Task<Course> CreateAsync(Course course)
        {
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return course;
        }

        public async Task<bool> UpdateAsync(Course course)
        {
            var existing = await _context.Courses.FindAsync(course.Id);
            if (existing == null) return false;
            existing.Name = course.Name;
            existing.Description = course.Description;
            existing.Photo = course.Photo;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return false;
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}