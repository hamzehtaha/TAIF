using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface ICourseLessonRepository : IRepository<CourseLesson>
{
    Task<List<CourseLesson>> GetByCourseIdAsync(Guid courseId);
    Task<List<CourseLesson>> GetByLessonIdAsync(Guid lessonId);
    Task<CourseLesson?> GetByCompositeKeyAsync(Guid courseId, Guid lessonId);
    Task<int> GetMaxOrderForCourseAsync(Guid courseId);
}
