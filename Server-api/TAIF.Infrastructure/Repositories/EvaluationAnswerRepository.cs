using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class EvaluationAnswerRepository
        : RepositoryBase<EvaluationAnswer>, IEvaluationAnswerRepository
    {
        private readonly TaifDbContext _context;

        public EvaluationAnswerRepository(TaifDbContext context)
            : base(context)
        {
            _context = context;
        }

        public async Task<List<EvaluationAnswer>> GetByQuestionIdAsync(Guid questionId, bool withDeleted = false)
        {
            return await FindNoTrackingAsync(
                a => a.EvaluationQuestionId == questionId,
                withDeleted
            );
        }
    }
}
