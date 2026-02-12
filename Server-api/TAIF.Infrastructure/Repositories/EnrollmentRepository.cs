using Microsoft.EntityFrameworkCore;
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
    public class EnrollmentRepository : RepositoryBase<Enrollment>, IEnrollmentRepository
    {
        private readonly TaifDbContext _context;

        public EnrollmentRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Dictionary<Guid, int>> GetEnrollmentCountsPerCourseAsync()
        {
            return await _context.Enrollments
                .Where(e => !e.IsDeleted)
                .GroupBy(e => e.CourseId)
                .Select(g => new { CourseId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CourseId, x => x.Count);
        }
    }
}
