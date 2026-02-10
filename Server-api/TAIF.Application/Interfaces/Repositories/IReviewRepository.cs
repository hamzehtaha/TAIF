using System.Linq.Expressions;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IReviewRepository : IRepository<Review>
    {
        Task<Review?> GetUserReviewForCourseAsync(Guid userId, Guid courseId);
        Task<List<Review>> GetByCourseIdWithIncludesAsync(Guid courseId);
        Task<List<Review>> GetByUserIdWithIncludesAsync(Guid userId);
        Task<List<Review>> GetByCourseIdAsync(Guid courseId);
        Task<bool> HasUserReviewedCourseAsync(Guid userId, Guid courseId);
        Task<PagedResult<Review>> GetPagedReviewsAsync(
            int page,
            int pageSize,
            Expression<Func<Review, bool>>? filter = null);
    }
}
