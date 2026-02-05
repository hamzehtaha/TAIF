using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IReviewService : IService<Review>
    {
        Task<Review?> GetUserReviewForCourseAsync(Guid userId, Guid courseId);
        Task<List<ReviewResponse>> GetCourseReviewsAsync(Guid courseId);
        Task<List<ReviewResponse>> GetUserReviewsAsync(Guid userId);
        Task<ReviewStatisticsResponse> GetCourseReviewStatisticsAsync(Guid courseId);
        Task<bool> HasUserReviewedCourseAsync(Guid userId, Guid courseId);
        Task<PagedResult<ReviewResponse>> GetPagedReviewsAsync(ReviewFilter filter);
    }
}
