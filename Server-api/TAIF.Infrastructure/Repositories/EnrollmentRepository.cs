using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class EnrollmentRepository : RepositoryBase<Enrollment>, IEnrollmentRepository
    {
        private readonly TaifDbContext _context;

        public EnrollmentRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Dictionary<Guid, int>> GetEnrollmentCountsPerCourseAsync()
        {
            return await _context.Enrollments
                .Where(e => !e.IsDeleted)
                .GroupBy(e => e.CourseId)
                .Select(g => new { CourseId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CourseId, x => x.Count);
        }

        /// <summary>
        /// Efficiently checks if user completed all lesson items in a course (single query).
        /// Uses cached Course.TotalLessonItems instead of counting lesson items.
        /// </summary>
        public async Task<bool> HasUserCompletedAllLessonItemsAsync(Guid userId, Guid courseId, int totalLessonItems)
        {
            // If course has no items, it can't be completed
            if (totalLessonItems == 0)
                return false;

            // Count how many lesson items the user has completed
            var completedCount = await _context.LessonItemProgress
                .Where(lip => lip.UserId == userId && 
                              lip.CourseID == courseId && 
                              lip.IsCompleted && 
                              !lip.IsDeleted)
                .CountAsync();

            return completedCount == totalLessonItems;
        }

        /// <summary>
        /// Batch check completion status for multiple courses (optimized for learning paths).
        /// Returns dictionary: CourseId -> IsComplete
        /// </summary>
        public async Task<Dictionary<Guid, bool>> CheckMultipleCourseCompletionsAsync(
            Guid userId, 
            Dictionary<Guid, int> courseIdToTotalItems)
        {
            if (!courseIdToTotalItems.Any())
                return new Dictionary<Guid, bool>();

            var courseIds = courseIdToTotalItems.Keys.ToList();

            // Single query: get completed item counts per course for this user
            var completedItemsPerCourse = await _context.LessonItemProgress
                .Where(lip => lip.UserId == userId && 
                              courseIds.Contains(lip.CourseID) && 
                              lip.IsCompleted && 
                              !lip.IsDeleted)
                .GroupBy(lip => lip.CourseID)
                .Select(g => new { CourseId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CourseId, x => x.Count);

            // Compare completed counts with total items
            var result = new Dictionary<Guid, bool>();
            foreach (var (courseId, totalItems) in courseIdToTotalItems)
            {
                var completedCount = completedItemsPerCourse.GetValueOrDefault(courseId, 0);
                result[courseId] = totalItems > 0 && completedCount == totalItems;
            }

            return result;
        }
    }
}
