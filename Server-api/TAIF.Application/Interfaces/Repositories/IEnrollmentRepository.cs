using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IEnrollmentRepository : IRepository<Enrollment>
    {
        /// <summary>
        /// Gets enrollment counts per course using database aggregation
        /// </summary>
        Task<Dictionary<Guid, int>> GetEnrollmentCountsPerCourseAsync();
        
        /// <summary>
        /// Checks if user completed all lesson items in a course.
        /// Uses cached totalLessonItems from Course entity for efficiency.
        /// </summary>
        Task<bool> HasUserCompletedAllLessonItemsAsync(Guid userId, Guid courseId, int totalLessonItems);
        
        /// <summary>
        /// Batch check completion for multiple courses (optimized for learning paths)
        /// </summary>
        Task<Dictionary<Guid, bool>> CheckMultipleCourseCompletionsAsync(
            Guid userId, 
            Dictionary<Guid, int> courseIdToTotalItems);
    }
}
