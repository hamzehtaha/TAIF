using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonRepository : ILessonRepository
    {
        private readonly TaifDbContext _context;

        public LessonRepository(TaifDbContext context)
        {
            _context = context;
        }

        public async Task<List<Lesson>> GetAllAsync()
        {
            return await _context.lessons.ToListAsync();
        }

        public async Task<Lesson?> GetByIdAsync(Guid id)
        {
            return await _context.lessons.FindAsync(id);
        }
        public async Task<List<Lesson>> GetByCourseIdAsync(Guid courseId)
        {
            return await _context.lessons
                .Where(li => li.CourseId == courseId)
                .ToListAsync();
        }

        public async Task<Lesson> CreateAsync(Lesson lesson)
        {
            _context.lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<bool> UpdateAsync(Lesson lesson)
        {
            var existing = await _context.lessons.FindAsync(lesson.Id);
            if (existing == null) return false;
            existing.Title = lesson.Title;
            existing.URL = lesson.URL;
            existing.CourseId = lesson.CourseId;
            existing.Photo = lesson.Photo;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var lesson = await _context.lessons.FindAsync(id);
            if (lesson == null) return false;
            _context.lessons.Remove(lesson);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}