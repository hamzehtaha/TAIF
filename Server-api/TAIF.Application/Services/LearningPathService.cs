using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LearningPathService : ServiceBase<LearningPath>, ILearningPathService
    {
        private readonly ILearningPathRepository _learningPathRepository;
        private readonly IUserLearningPathProgressRepository _progressRepository;

        public LearningPathService(
            ILearningPathRepository repository,
            IUserLearningPathProgressRepository progressRepository) : base(repository)
        {
            _learningPathRepository = repository;
            _progressRepository = progressRepository;
        }

        public async Task<List<LearningPathResponseDTO>> GetAllLearningPathsAsync(Guid userId)
        {
            var learningPaths = await _learningPathRepository.GetAllWithSectionsAndCoursesAsync();

            var enrolledProgress = await _progressRepository.FindNoTrackingAsync(
                predicate: p => p.UserId == userId,
                withDeleted: false
            );

            var enrolledIds = new HashSet<Guid>(enrolledProgress.Select(e => e.LearningPathId));

            return learningPaths.Select(lp => new LearningPathResponseDTO
            {
                Id = lp.Id,
                Name = lp.Name,
                Description = lp.Description,
                Photo = lp.Photo,
                TotalEnrolled = lp.TotalEnrolled,
                DurationInSeconds = lp.DurationInSeconds,
                TotalSections = lp.Sections?.Count ?? 0,
                TotalCourses = lp.Sections?.Sum(s => s.Courses?.Count ?? 0) ?? 0,
                CreatedAt = lp.CreatedAt,
                IsEnrolled = enrolledIds.Contains(lp.Id)
            }).ToList();
        }

        public async Task<LearningPathDetailsResponseDTO?> GetLearningPathDetailsAsync(Guid id, Guid userId)
        {
            var learningPath = await _learningPathRepository.GetWithSectionsAndCoursesAsync(id);
            if (learningPath == null)
                return null;

            var isEnrolled = await _progressRepository.AnyAsync(
                predicate: p => p.UserId == userId && p.LearningPathId == id,
                withDeleted: false
            );

            return new LearningPathDetailsResponseDTO
            {
                Id = learningPath.Id,
                Name = learningPath.Name,
                Description = learningPath.Description,
                Photo = learningPath.Photo,
                TotalEnrolled = learningPath.TotalEnrolled,
                DurationInSeconds = learningPath.DurationInSeconds,
                CreatedAt = learningPath.CreatedAt,
                IsEnrolled = isEnrolled,
                Sections = learningPath.Sections.Select(s => new LearningPathSectionDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Order = s.Order,
                    Courses = s.Courses.Select(c => new LearningPathCourseDTO
                    {
                        Id = c.Id,
                        Order = c.Order,
                        IsRequired = c.IsRequired,
                        CourseId = c.CourseId,
                        CourseName = c.Course.Name ?? string.Empty,
                        CourseDescription = c.Course.Description,
                        CoursePhoto = c.Course.Photo,
                        CourseDurationInSeconds = c.Course.TotalDurationInSeconds
                    }).ToList()
                }).ToList()
            };
        }
    }
}