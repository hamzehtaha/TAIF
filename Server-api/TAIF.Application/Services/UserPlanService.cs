using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class UserPlanService : IUserPlanService
    {
        private readonly IUserEvaluationRepository _evaluationRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly IAiHelperService _ai;

        public UserPlanService(
            IUserEvaluationRepository evaluationRepository,
            IQuestionRepository questionRepository,
            ILessonItemRepository lessonItemRepository,
            IAiHelperService ai)
        {
            _evaluationRepository = evaluationRepository;
            _questionRepository = questionRepository;
            _lessonItemRepository = lessonItemRepository;
            _ai = ai;
        }

        public async Task<UserLearningPlanResponse> GeneratePlanAsync(Guid userId, Guid organizationId)
        {
            var evaluation = await _evaluationRepository.GetByUserIdAsync(userId);

            if (evaluation == null)
                throw new Exception("User has not completed evaluation.");

            var questionIds = evaluation.Result.Questions
                .Select(q => q.QuestionId)
                .ToList();

            var questions = await _questionRepository
                .FindNoTrackingAsync(q => questionIds.Contains(q.Id));

            var missingSkills = new HashSet<Guid>();

            foreach (var result in evaluation.Result.Questions)
            {
                var question = questions.First(q => q.Id == result.QuestionId);

                if (result.Percentage < question.MinPercentage)
                {
                    foreach (var skillId in question.SkillIds)
                        missingSkills.Add(skillId);
                }
            }


            var lessonItems = await _lessonItemRepository
                    .GetBySkillsAsync(missingSkills.ToList());

            var prompt = BuildAiPrompt(missingSkills.ToList(), lessonItems);

            var aiResponse = await _ai.AskAsync(prompt);

            List<LessonItem> orderedLessons;

            try
            {
                var aiPlan = JsonSerializer.Deserialize<AiLessonPlan>(aiResponse);

                if (aiPlan != null && aiPlan.LessonOrder.Any())
                {
                    orderedLessons = aiPlan.LessonOrder
                        .Select(id => lessonItems.FirstOrDefault(l => l.Id == id))
                        .Where(l => l != null)
                        .ToList()!;
                }
                else
                {
                    throw new Exception("Invalid AI response");
                }
            }
            catch
            {
                // fallback if AI fails
                orderedLessons = lessonItems
                    .OrderBy(l => l.DurationInSeconds)
                    .ToList();
            }
            return new UserLearningPlanResponse
            {
                MissingSkillIds = missingSkills.ToList(),
                RecommendedLessons = orderedLessons.Select(l => new LessonPlanItemDto
                {
                    LessonItemId = l.Id,
                    Name = l.Name,
                    DurationInSeconds = l.DurationInSeconds
                }).ToList()
            };
        }

        private string BuildAiPrompt(List<Guid> skills, List<LessonItem> lessons)
        {
            var sb = new StringBuilder();

            sb.AppendLine("You are an AI learning planner.");
            sb.AppendLine("Create the best lesson order for the user.");
            sb.AppendLine();
            sb.AppendLine("Missing Skills:");

            foreach (var skill in skills)
                sb.AppendLine(skill.ToString());

            sb.AppendLine();
            sb.AppendLine("Available Lessons:");

            foreach (var lesson in lessons)
            {
                sb.AppendLine($"LessonId:{lesson.Id}");
                sb.AppendLine($"Name:{lesson.Name}");
                sb.AppendLine($"Duration:{lesson.DurationInSeconds}");
                sb.AppendLine($"Skills:{string.Join(",", lesson.SkillIds)}");
                sb.AppendLine();
            }

            sb.AppendLine("Return JSON only in this format:");
            sb.AppendLine("{ \"lessonOrder\": [\"lessonId\",\"lessonId\"] }");

            return sb.ToString();
        }
    }
}
