using TAIF.Domain.Models;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IEvaluationQuestionMappingRepository : IRepository<EvaluationQuestionMapping>
    {
        Task<List<EvaluationQuestionMapping>> GetByEvaluationIdAsync(Guid evaluationId, bool withDeleted = false);
    }
}
