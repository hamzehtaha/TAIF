using System.Text.Json;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using TAIF.Domain.Models;

namespace TAIF.Application.Services
{
    public class UserEvaluationService : ServiceBase<UserEvaluation>, IUserEvaluationService
    {
        private readonly IUserEvaluationRepository _repository;
        private readonly IEvaluationAnswerRepository _answerRepository;
        private readonly IEvaluationQuestionRepository _evaluationQuestionRepository;
        
        public UserEvaluationService(
            IUserEvaluationRepository repository, 
            IEvaluationAnswerRepository answerRepository, 
            IEvaluationQuestionRepository evaluationQuestionRepository)
            : base(repository)
        {
            _repository = repository;
            _answerRepository = answerRepository;
            _evaluationQuestionRepository = evaluationQuestionRepository;
        }

        public async Task<bool> ExistsForUserAsync(Guid userId)
        {
            return await _repository.ExistsForUserAsync(userId);
        }

        public async Task<UserEvaluation?> GetByUserIdAsync(Guid userId)
        {
            return await _repository.GetByUserIdAsync(userId);
        }
        public async Task<UserEvaluation> SubmitAsync(Guid userId, Guid organizationId, SubmitEvaluation dto)
        {
            if (dto.Answers == null || !dto.Answers.Any())
                throw new Exception("Answers are required.");

            var questionIds = dto.Answers.Select(a => a.QuestionId).ToList();

            var allQuestions = await _evaluationQuestionRepository.GetAllWithAnswersAsync();
            var questions = allQuestions.Where(q => questionIds.Contains(q.Id)).ToList();

            if (questions.Count != questionIds.Count)
                throw new Exception("Invalid questions submitted.");

            var result = new EvaluationJsonResult();

            foreach (var submitted in dto.Answers)
            {
                var question = questions.First(q => q.Id == submitted.QuestionId);
                var questionAnswerIds = question.Answers.Select(a => a.Id).ToList();

                if (!questionAnswerIds.Contains(submitted.AnswerId))
                    throw new Exception("Invalid answer for question.");

                var selectedAnswer = question.Answers.First(a => a.Id == submitted.AnswerId);

                result.Questions.Add(new QuestionEvaluationResult
                {
                    QuestionId = question.Id,
                    SelectedAnswerId = submitted.AnswerId,
                    Percentage = selectedAnswer.Score
                });
            }

            result.TotalPercentage = result.Questions.Any()
                ? (int)result.Questions.Average(q => q.Percentage)
                : 0;

            // Aggregate per-skill scores across all answered questions
            var skillScores = new Dictionary<Guid, List<int>>();
            foreach (var qResult in result.Questions)
            {
                var question = questions.First(q => q.Id == qResult.QuestionId);
                foreach (var skillId in question.SkillIds)
                {
                    if (!skillScores.ContainsKey(skillId))
                        skillScores[skillId] = new List<int>();
                    skillScores[skillId].Add(qResult.Percentage);
                }
            }

            // Strength: avg score >= 75 (knows it well) | Weakness: avg score < 75 (needs to learn it)
            result.StrengthSkillIds = skillScores
                .Where(kv => (int)kv.Value.Average() >= 75)
                .Select(kv => kv.Key)
                .ToList();

            result.WeaknessSkillIds = skillScores
                .Where(kv => (int)kv.Value.Average() < 75)
                .Select(kv => kv.Key)
                .ToList();

            var evaluation = new UserEvaluation
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OrganizationId = organizationId,
                Result = result
            };

            await _repository.AddAsync(evaluation);
            await _repository.SaveChangesAsync();

            return evaluation;
        }
    }
}
