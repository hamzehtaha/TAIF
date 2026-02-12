using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IEnrollmentRepository : IRepository<Enrollment>
    {
        /// <summary>
        /// Gets enrollment counts per course using database aggregation
        /// </summary>
        Task<Dictionary<Guid, int>> GetEnrollmentCountsPerCourseAsync();
    }
}
