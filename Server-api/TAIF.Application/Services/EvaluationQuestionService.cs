using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class EvaluationQuestionService
        : ServiceBase<EvaluationQuestion>, IEvaluationQuestionService
    {
        private readonly IEvaluationQuestionRepository _repository;

        public EvaluationQuestionService(
            IEvaluationQuestionRepository repository)
            : base(repository)
        {
            _repository = repository;
        }

        public async Task<List<EvaluationQuestionResponseDto>> GetAllWithAnswersAsync()
        {
            var questions = await _repository.GetAllWithAnswersAsync();

            return questions
                .OrderBy(q => q.Order)
                .Select(q => new EvaluationQuestionResponseDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Order = q.Order,
                    Answers = q.Answers
                        .Where(a => !a.IsDeleted)
                        .Select(a => new EvaluationAnswerResponseDto
                        {
                            Id = a.Id,
                            Text = a.Text,
                            Score = a.Score
                        })
                        .ToList()
                })
                .ToList();
        }
    }
}
