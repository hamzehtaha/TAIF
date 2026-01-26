using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<List<Course>> GetByCategoryIdAsync(Guid categoryId, bool withDeleted = false);
    }
}