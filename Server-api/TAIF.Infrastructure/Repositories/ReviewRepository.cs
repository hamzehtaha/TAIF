using System.Linq.Expressions;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class ReviewRepository : RepositoryBase<Review>, IReviewRepository
    {
        private readonly TaifDbContext _context;

        public ReviewRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Review?> GetUserReviewForCourseAsync(Guid userId, Guid courseId)
        {
            return await FindOneNoTrackingAsync(r => r.UserId == userId && r.CourseId == courseId);
        }

        public async Task<List<Review>> GetByCourseIdWithIncludesAsync(Guid courseId)
        {
            return await FindWithIncludesNoTrackingAsync(
                r => r.CourseId == courseId,
                orderBy: r => r.ReviewedAt,
                orderByDescending: true,
                includes: [r => r.User, r => r.Course]
            );
        }

        public async Task<List<Review>> GetByUserIdWithIncludesAsync(Guid userId)
        {
            return await FindWithIncludesNoTrackingAsync(
                r => r.UserId == userId,
                orderBy: r => r.ReviewedAt,
                orderByDescending: true,
                includes: [r => r.User, r => r.Course]
            );
        }

        public async Task<List<Review>> GetByCourseIdAsync(Guid courseId)
        {
            return await FindWithIncludesNoTrackingAsync(
                r => r.CourseId == courseId,
                includes: r => r.Course
            );
        }

        public async Task<bool> HasUserReviewedCourseAsync(Guid userId, Guid courseId)
        {
            return await AnyAsync(r => r.UserId == userId && r.CourseId == courseId);
        }

        public async Task<PagedResult<Review>> GetPagedReviewsAsync(
            int page,
            int pageSize,
            Expression<Func<Review, bool>>? filter = null)
        {
            return await GetPagedAsync(
                page: page,
                pageSize: pageSize,
                filter: filter,
                orderBy: r => r.ReviewedAt,
                orderByDescending: true,
                includes: [r => r.User, r => r.Course]
            );
        }
    }
}
