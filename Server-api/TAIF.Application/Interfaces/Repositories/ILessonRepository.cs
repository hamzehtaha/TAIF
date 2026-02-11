using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonRepository : IRepository<Lesson>
    {
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false);
        
        /// <summary>
        /// Gets total duration per course by joining lessons with their lesson items
        /// </summary>
        Task<Dictionary<Guid, double>> GetTotalDurationPerCourseAsync();
    }
}
