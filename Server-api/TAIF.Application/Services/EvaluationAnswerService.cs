using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class EvaluationAnswerService
       : ServiceBase<EvaluationAnswer>, IEvaluationAnswerService
    {
        private readonly IEvaluationAnswerRepository _repository;

        public EvaluationAnswerService(
            IEvaluationAnswerRepository repository)
            : base(repository)
        {
            _repository = repository;
        }

        public async Task<List<EvaluationAnswer>> GetByQuestionIdAsync(Guid questionId)
        {
            return await _repository.GetByQuestionIdAsync(questionId);
        }
    }
}
