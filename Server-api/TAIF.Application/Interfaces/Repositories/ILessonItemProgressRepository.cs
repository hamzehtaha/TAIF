using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonItemProgressRepository : IRepository<LessonItemProgress>
    {
        Task<double> GetCompletedDurationSumAsync(Guid userId, Guid courseId);
        Task<double> GetCompletedDurationSumForCoursesAsync(Guid userId, List<Guid> courseIds);
    }
}
