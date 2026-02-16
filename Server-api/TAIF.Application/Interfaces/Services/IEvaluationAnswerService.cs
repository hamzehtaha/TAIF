using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IEvaluationAnswerService : IService<EvaluationAnswer>
    {
        Task<List<EvaluationAnswer>> GetByQuestionIdAsync(Guid questionId);
    }
}
