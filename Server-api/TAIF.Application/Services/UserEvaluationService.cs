using System.Text.Json;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class UserEvaluationService
        : ServiceBase<UserEvaluation>, IUserEvaluationService
    {
        private readonly IUserEvaluationRepository _repository;
        private readonly IEvaluationAnswerRepository _answerRepository;

        public UserEvaluationService(IUserEvaluationRepository repository, IEvaluationAnswerRepository answerRepository)
            : base(repository)
        {
            _repository = repository;
            _answerRepository = answerRepository;
        }

        public async Task<bool> ExistsForUserAsync(Guid userId)
        {
            return await _repository.ExistsForUserAsync(userId);
        }

        public async Task<UserEvaluation?> GetByUserIdAsync(Guid userId)
        {
            return await _repository.GetByUserIdAsync(userId);
        }
        public async Task<UserEvaluation> SubmitAsync(Guid userId, SubmitEvaluation dto)
        {
            if (await _repository.ExistsForUserAsync(userId))
                throw new Exception("User already completed evaluation.");

            if (dto.Answers == null || !dto.Answers.Any())
                throw new Exception("Answers are required.");

            var answerIds = dto.Answers.Select(a => a.AnswerId).ToList();

            var answers = await _answerRepository.FindNoTrackingAsync(
                a => answerIds.Contains(a.Id)
            );

            if (answers.Count != answerIds.Count)
                throw new Exception("Invalid answers submitted.");

            int totalScore = answers.Sum(a => a.Score);

            var evaluation = new UserEvaluation
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AnswersJson = JsonSerializer.Serialize(dto.Answers),
                TotalScore = totalScore,
                CompletedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(evaluation);
            await _repository.SaveChangesAsync();

            return evaluation;
        }
    }
}
