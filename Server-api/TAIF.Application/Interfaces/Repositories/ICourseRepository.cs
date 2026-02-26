using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<List<Course>> GetByCategoryIdAsync(Guid categoryId, bool withDeleted = false);
        Task<List<Course>> GetByUserIdAsync(Guid userId);
        Task<Course?> GetByIdWithCategoryAsync(Guid id, bool withDeleted = false);
    }
}