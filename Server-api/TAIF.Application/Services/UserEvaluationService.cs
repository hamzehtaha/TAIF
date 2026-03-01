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
        private readonly IQuestionRepository _questionRepository;
        public UserEvaluationService(IUserEvaluationRepository repository, IEvaluationAnswerRepository answerRepository, IQuestionRepository questionRepository)
            : base(repository)
        {
            _repository = repository;
            _answerRepository = answerRepository;
            _questionRepository = questionRepository;
        }

        public async Task<bool> ExistsForUserAsync(Guid userId)
        {
            return await _repository.ExistsForUserAsync(userId);
        }

        public async Task<UserEvaluation?> GetByUserIdAsync(Guid userId)
        {
            return await _repository.GetByUserIdAsync(userId);
        }
        public async Task<UserEvaluation> SubmitAsync(Guid userId,Guid organizationId, SubmitEvaluation dto)
        {
            if (dto.Answers == null || !dto.Answers.Any())
                throw new Exception("Answers are required.");

            var questionIds = dto.Answers.Select(a => a.QuestionId).ToList();

            var questions = await _questionRepository.FindNoTrackingAsync(
                q => questionIds.Contains(q.Id)
            );

            if (questions.Count != questionIds.Count)
                throw new Exception("Invalid questions submitted.");

            var result = new EvaluationJsonResult();

            foreach (var submitted in dto.Answers)
            {
                var question = questions.First(q => q.Id == submitted.QuestionId);

                if (!question.AnswerIds.Contains(submitted.AnswerId))
                    throw new Exception("Invalid answer for question.");

                // Determine correct answer
                var correctAnswerId = question.AnswerIds[question.CorrectAnswerIndex];

                int percentage = submitted.AnswerId == correctAnswerId ? 100 : 0;

                result.Questions.Add(new QuestionEvaluationResult
                {
                    QuestionId = question.Id,
                    SelectedAnswerId = submitted.AnswerId,
                    Percentage = percentage
                });
            }

            // Calculate total average
            result.TotalPercentage = result.Questions.Any()
                ? (int)result.Questions.Average(q => q.Percentage)
                : 0;

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
