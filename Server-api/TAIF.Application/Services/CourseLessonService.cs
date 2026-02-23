using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class CourseLessonService : ServiceBase<CourseLesson>, ICourseLessonService
{
    private readonly ICourseLessonRepository _courseLessonRepository;

    public CourseLessonService(ICourseLessonRepository repository) : base(repository)
    {
        _courseLessonRepository = repository;
    }

    public async Task<List<CourseLesson>> GetByCourseIdAsync(Guid courseId)
    {
        return await _courseLessonRepository.GetByCourseIdAsync(courseId);
    }

    public async Task<List<CourseLesson>> GetByLessonIdAsync(Guid lessonId)
    {
        return await _courseLessonRepository.GetByLessonIdAsync(lessonId);
    }

    public async Task<CourseLesson> AssignLessonToCourseAsync(Guid courseId, Guid lessonId, int? order = null)
    {
        // Check if already assigned
        var existing = await _courseLessonRepository.GetByCompositeKeyAsync(courseId, lessonId);
        if (existing != null)
            throw new InvalidOperationException("Lesson is already assigned to this course");

        // Get max order if not provided
        var assignedOrder = order ?? (await _courseLessonRepository.GetMaxOrderForCourseAsync(courseId)) + 1;

        var courseLesson = new CourseLesson
        {
            CourseId = courseId,
            LessonId = lessonId,
            Order = assignedOrder
        };

        await _courseLessonRepository.AddAsync(courseLesson);
        await _courseLessonRepository.SaveChangesAsync();

        return courseLesson;
    }

    public async Task<bool> UnassignLessonFromCourseAsync(Guid courseId, Guid lessonId)
    {
        var courseLesson = await _courseLessonRepository.GetByCompositeKeyAsync(courseId, lessonId);
        if (courseLesson == null)
            return false;

        _courseLessonRepository.SoftDelete(courseLesson);
        await _courseLessonRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateOrderAsync(Guid courseId, Guid lessonId, int newOrder)
    {
        var courseLesson = await _courseLessonRepository.GetByCompositeKeyAsync(courseId, lessonId);
        if (courseLesson == null)
            return false;

        courseLesson.Order = newOrder;
        _courseLessonRepository.Update(courseLesson, cl => cl.Order);
        await _courseLessonRepository.SaveChangesAsync();
        return true;
    }
}
