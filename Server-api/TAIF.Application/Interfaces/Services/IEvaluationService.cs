using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IEvaluationService : IService<Evaluation>
    {
        Task<Evaluation> UpdateWithMappingsAsync(Guid id, Evaluation updatedEvaluation);
        Task<List<Evaluation>> GetByInterestIdsAsync(List<Guid> interestIds);
    }
}
