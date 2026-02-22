using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IEvaluationAnswerRepository : IRepository<EvaluationAnswer>
    {
        Task<List<EvaluationAnswer>> GetByQuestionIdAsync(Guid questionId, bool withDeleted = false);
    }
}
