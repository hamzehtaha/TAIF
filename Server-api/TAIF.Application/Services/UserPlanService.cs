using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Application.Services
{
    public class UserPlanService : IUserPlanService
    {
        private readonly IUserEvaluationRepository _evaluationRepository;
        private readonly ILessonItemRepository _lessonItemRepository;

        public UserPlanService(
            IUserEvaluationRepository evaluationRepository,
            ILessonItemRepository lessonItemRepository)
        {
            _evaluationRepository = evaluationRepository;
            _lessonItemRepository = lessonItemRepository;
        }

        public async Task<UserLearningPlanResponse> GeneratePlanAsync(Guid userId)
        {
            var evaluation = await _evaluationRepository.GetByUserIdAsync(userId);

            if (evaluation == null)
                throw new Exception("User has not completed evaluation.");

            var allItems = await _lessonItemRepository.GetAllWithContentAsync();

            return new UserLearningPlanResponse
            {
                StrengthSkillIds = evaluation.Result.StrengthSkillIds,
                WeaknessSkillIds = evaluation.Result.WeaknessSkillIds,
                LessonItems = allItems.Select(l => new LessonPlanItemDto
                {
                    LessonItemId = l.Id,
                    Name = l.Name,
                    DurationInSeconds = l.DurationInSeconds,
                    SkillIds = l.SkillIds.ToList()
                }).ToList()
            };
        }
    }
}
