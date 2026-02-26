using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface ICourseLessonService : IService<CourseLesson>
{
    Task<List<CourseLesson>> GetByCourseIdAsync(Guid courseId);
    Task<CourseLesson> AssignLessonToCourseAsync(Guid courseId, Guid lessonId, int? order = null);
    Task<bool> UnassignLessonFromCourseAsync(Guid courseId, Guid lessonId);
    Task<bool> UpdateOrderAsync(Guid courseId, Guid lessonId, int newOrder);
    Task<bool> BulkReorderAsync(Guid courseId, List<(Guid LessonId, int Order)> items);
}
