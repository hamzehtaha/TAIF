using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonItemProgressRepository : RepositoryBase<LessonItemProgress>, ILessonItemProgressRepository
    {
        public LessonItemProgressRepository(TaifDbContext context) : base(context)
        {

        }
    }
}
