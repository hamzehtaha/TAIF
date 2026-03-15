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
    public class EvaluationService : ServiceBase<Evaluation>, IEvaluationService
    {
        private readonly IEvaluationRepository _repository;
        public EvaluationService(IEvaluationRepository repository, IEvaluationAnswerRepository answerRepository, IQuestionRepository questionRepository)
            : base(repository)
        {
            _repository = repository;
        }
    }
}
