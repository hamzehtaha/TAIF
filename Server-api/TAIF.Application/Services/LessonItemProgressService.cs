using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonItemProgressService : ServiceBase<LessonItemProgress>, ILessonItemProgressService
    {
        private readonly ILessonItemProgressRepository _lessonItemProgressRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;

        public LessonItemProgressService(IEnrollmentRepository enrollmentRepository ,ILessonItemProgressRepository repository) : base(repository)
        {
            _lessonItemProgressRepository = repository;
            _enrollmentRepository = enrollmentRepository;
        }

        public async Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto)
        {
            LessonItemProgress lessonItemProgress = new LessonItemProgress
            {
                UserId = UserId,
                LessonItemId = dto.LessonItemId,
                IsCompleted = true
            };
            await _lessonItemProgressRepository.AddAsync(lessonItemProgress);
            Enrollment enrollment = await _enrollmentRepository.FindOneAsync((x)=>x.UserId.Equals(UserId) && x.CourseId.Equals(dto.CourseId));
            enrollment.LastLessonItemId = dto.LessonItemId;
            await _repository.SaveChangesAsync();
            return lessonItemProgress;
        }
    }
}
