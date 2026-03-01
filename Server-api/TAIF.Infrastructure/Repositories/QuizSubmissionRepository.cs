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
    public class QuizSubmissionRepository : RepositoryBase<QuizSubmission>, IQuizSubmissionRepository
    {
        public QuizSubmissionRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<QuizSubmission?> GetByUserAndLessonItemAsync(Guid userId, Guid lessonItemId)
        {
            return await FindOneAsync(x => x.UserId == userId && x.LessonItemId == lessonItemId);
        }
    }
}
