using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IInterestTagMappingRepository _mappingRepo;
        private readonly IEnrollmentRepository _enrollmentRepo;
        private readonly ICourseRepository _courseRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserCourseBehaviorRepository _behaviorRepo;

        public RecommendationService(
            IInterestTagMappingRepository mappingRepo,
            IEnrollmentRepository enrollmentRepo,
            ICourseRepository courseRepo,
            IUserRepository userRepo,
            IUserCourseBehaviorRepository behaviorRepo)
        {
            _mappingRepo = mappingRepo;
            _enrollmentRepo = enrollmentRepo;
            _courseRepo = courseRepo;
            _userRepo = userRepo;
            _behaviorRepo = behaviorRepo;
        }

        public async Task<List<Course>> GetRecommendedCoursesAsync(Guid userId, int count)
        {
            count = Math.Clamp(count, 1, RecommendationConfig.MaxRecommendationCount);

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return new List<Course>();

            if (!user.Interests.Any())
                return new List<Course>();

            var enrollments = await _enrollmentRepo.FindNoTrackingAsync(e => e.UserId == userId);
            var enrolledIds = enrollments.Select(e => e.CourseId).ToHashSet();

            var allCourses = await _courseRepo.GetAllNoTrackingAsync();

            var allMappings = await _mappingRepo.GetAllNoTrackingAsync();

            var mappingsByInterest = allMappings
                .GroupBy(m => m.InterestId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var userBehaviors = await _behaviorRepo.FindNoTrackingAsync((x) => x.UserId == userId);
            var behaviorByCourse = userBehaviors.ToDictionary(b => b.CourseId, b => b);

            var recommendations = new List<CourseRecommendation>();

            foreach (var course in allCourses)
            {
                if (enrolledIds.Contains(course.Id) || !course.Tags.Any())
                    continue;

                double baseScore = CalculateBaseScore(new HashSet<Guid>(user.Interests), new HashSet<Guid>(course.Tags), mappingsByInterest);

                double behaviorFactor = CalculateBehaviorFactor(course.Id, behaviorByCourse);

                double finalScore = baseScore * behaviorFactor;

                if (finalScore > 0)
                {
                    recommendations.Add(new CourseRecommendation
                    {
                        CourseId = course.Id,
                        FinalScore = finalScore,
                        BaseScore = baseScore,
                        BehaviorFactor = behaviorFactor
                    });
                }
            }

            var recommendedCourseIds = recommendations.OrderByDescending(r => r.FinalScore).Take(count).Select(r => r.CourseId).ToList();

            return allCourses.Where((course) => recommendedCourseIds.Contains(course.Id)).ToList();
        }

        public async Task RecordEventAsync(Guid userId, Guid courseId, BehaviorEventType eventType)
        {
            var config = RecommendationConfig.GetConfig(eventType);
            if (Math.Abs(config.Effect) < 0.001)
                return;

            var behavior = await _behaviorRepo.FindOneNoTrackingAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            if (behavior == null)
            {
                behavior = new UserCourseBehavior
                {
                    UserId = userId,
                    CourseId = courseId,
                    BehaviorScore = config.Effect,
                    UpdatedAt = DateTime.UtcNow // should update the "Updated At"
                };
                await _behaviorRepo.AddAsync(behavior);
            }
            else
            {
                var decayedScore = RecommendationConfig.ApplyDecay(behavior.BehaviorScore, (DateTime)behavior.UpdatedAt);
                behavior.BehaviorScore = decayedScore + config.Effect;
                behavior.UpdatedAt = DateTime.UtcNow;
            }

            await _behaviorRepo.SaveChangesAsync();
        }

        private double CalculateBaseScore(HashSet<Guid> userInterestIds, HashSet<Guid> courseTagIds, Dictionary<Guid, List<InterestTagMapping>> mappingsByInterest)
        {
            double totalScore = 0.0;

            foreach (var interestId in userInterestIds)
            {
                if (!mappingsByInterest.TryGetValue(interestId, out var mappings))
                    continue;

                foreach (var mapping in mappings)
                {
                    if (courseTagIds.Contains(mapping.TagId))
                    {
                        totalScore += mapping.Weight;
                    }
                }
            }

            return totalScore;
        }

        private double CalculateBehaviorFactor(Guid courseId, Dictionary<Guid, UserCourseBehavior> behaviorByCourse)
        {
            if (!behaviorByCourse.TryGetValue(courseId, out var behavior))
                return 1.0;

            var decayedScore = RecommendationConfig.ApplyDecay(behavior.BehaviorScore, (DateTime)behavior.UpdatedAt);
            var factor = 1.0 + decayedScore;
            return Math.Clamp(factor, RecommendationConfig.MinBehaviorFactor, RecommendationConfig.MaxBehaviorFactor);
        }
    }
}
