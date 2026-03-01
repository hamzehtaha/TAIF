using TAIF.Application.DTOs;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonRepository : IRepository<Lesson>
    {
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false);
        
        /// <summary>
        /// Gets total duration and lesson item count per course by joining lessons with their lesson items.
        /// Combines both aggregations in a single optimized query.
        /// </summary>
        Task<Dictionary<Guid, CourseStatisticsDTO>> GetCourseStatisticsAsync();
        Task<CourseStatisticsDTO?> GetCourseStatisticsForSingleCourseAsync(Guid courseId);
        
        /// <summary>
        /// Gets lesson count per course using the CourseLesson junction table
        /// </summary>
        Task<Dictionary<Guid, int>> GetLessonCountPerCourseAsync();
    }
}
