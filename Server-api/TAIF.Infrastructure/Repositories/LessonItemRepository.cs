using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonItemRepository : ILessonItemRepository
    {
        private readonly TaifDbContext _context;

        public LessonItemRepository(TaifDbContext context)
        {
            _context = context;
        }

        public async Task<List<LessonItem>> GetAllAsync()
        {
            return await _context.LessonItems.ToListAsync();
        }

        public async Task<LessonItem?> GetByIdAsync(int id)
        {
            return await _context.LessonItems.FindAsync(id);
        }
        public async Task<List<LessonItem>> GetByCourseIdAsync(int courseId)
        {
            return await _context.LessonItems
                .Where(li => li.CourseId == courseId)
                .ToListAsync();
        }

        public async Task<LessonItem> CreateAsync(LessonItem lessonItem)
        {
            _context.LessonItems.Add(lessonItem);
            await _context.SaveChangesAsync();
            return lessonItem;
        }

        public async Task<bool> UpdateAsync(LessonItem lessonItem)
        {
            var existing = await _context.LessonItems.FindAsync(lessonItem.Id);
            if (existing == null) return false;
            existing.Title = lessonItem.Title;
            existing.URL = lessonItem.URL;
            existing.LessonType = lessonItem.LessonType;
            existing.CourseId = lessonItem.CourseId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var lessonItem = await _context.LessonItems.FindAsync(id);
            if (lessonItem == null) return false;
            _context.LessonItems.Remove(lessonItem);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}