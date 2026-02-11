namespace TAIF.Application.Interfaces.Services
{
    /// <summary>
    /// Service for calculating and updating course statistics.
    /// This orchestrates between Course, Enrollment, Lesson, and LessonItem without creating circular dependencies.
    /// </summary>
    public interface ICourseStatisticsService
    {
        /// <summary>
        /// Updates TotalEnrolled and TotalDurationInSeconds for all courses efficiently
        /// </summary>
        Task UpdateAllCourseStatisticsAsync();

        /// <summary>
        /// Updates statistics for a specific course
        /// </summary>
        /// <param name="courseId">The course ID to update</param>
        /// <returns>True if the course was found and updated, false if not found</returns>
        Task<bool> UpdateCourseStatisticsAsync(Guid courseId);
    }
}