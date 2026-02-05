using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class ReviewService : ServiceBase<Review>, IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository repository) : base(repository)
        {
            _reviewRepository = repository;
        }

        public async Task<Review?> GetUserReviewForCourseAsync(Guid userId, Guid courseId)
        {
            return await _reviewRepository.GetUserReviewForCourseAsync(userId, courseId);
        }

        public async Task<List<ReviewResponse>> GetCourseReviewsAsync(Guid courseId)
        {
            var reviews = await _reviewRepository.GetByCourseIdWithIncludesAsync(courseId);
            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<List<ReviewResponse>> GetUserReviewsAsync(Guid userId)
        {
            var reviews = await _reviewRepository.GetByUserIdWithIncludesAsync(userId);
            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<ReviewStatisticsResponse> GetCourseReviewStatisticsAsync(Guid courseId)
        {
            var reviews = await _reviewRepository.GetByCourseIdAsync(courseId);

            var totalReviews = reviews.Count;
            var courseName = reviews.FirstOrDefault()?.Course?.Name;

            if (totalReviews == 0)
            {
                return new ReviewStatisticsResponse
                {
                    CourseId = courseId,
                    CourseName = courseName,
                    TotalReviews = 0,
                    AverageRating = 0,
                    FiveStarCount = 0,
                    FourStarCount = 0,
                    ThreeStarCount = 0,
                    TwoStarCount = 0,
                    OneStarCount = 0,
                    FiveStarPercentage = 0,
                    FourStarPercentage = 0,
                    ThreeStarPercentage = 0,
                    TwoStarPercentage = 0,
                    OneStarPercentage = 0
                };
            }

            var fiveStarCount = reviews.Count(r => r.Rating == 5);
            var fourStarCount = reviews.Count(r => r.Rating == 4);
            var threeStarCount = reviews.Count(r => r.Rating == 3);
            var twoStarCount = reviews.Count(r => r.Rating == 2);
            var oneStarCount = reviews.Count(r => r.Rating == 1);

            return new ReviewStatisticsResponse
            {
                CourseId = courseId,
                CourseName = courseName,
                TotalReviews = totalReviews,
                AverageRating = Math.Round(reviews.Average(r => r.Rating), 2),
                FiveStarCount = fiveStarCount,
                FourStarCount = fourStarCount,
                ThreeStarCount = threeStarCount,
                TwoStarCount = twoStarCount,
                OneStarCount = oneStarCount,
                FiveStarPercentage = Math.Round((double)fiveStarCount / totalReviews * 100, 2),
                FourStarPercentage = Math.Round((double)fourStarCount / totalReviews * 100, 2),
                ThreeStarPercentage = Math.Round((double)threeStarCount / totalReviews * 100, 2),
                TwoStarPercentage = Math.Round((double)twoStarCount / totalReviews * 100, 2),
                OneStarPercentage = Math.Round((double)oneStarCount / totalReviews * 100, 2)
            };
        }

        public async Task<bool> HasUserReviewedCourseAsync(Guid userId, Guid courseId)
        {
            return await _reviewRepository.HasUserReviewedCourseAsync(userId, courseId);
        }

        public async Task<PagedResult<ReviewResponse>> GetPagedReviewsAsync(ReviewFilter filter)
        {
            Expression<Func<Review, bool>>? predicate = BuildFilterPredicate(filter);

            var pagedResult = await _reviewRepository.GetPagedReviewsAsync(
                page: filter.Page,
                pageSize: filter.PageSize,
                filter: predicate
            );

            return new PagedResult<ReviewResponse>
            {
                Items = pagedResult.Items.Select(MapToResponse).ToList(),
                Page = pagedResult.Page,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        private static Expression<Func<Review, bool>>? BuildFilterPredicate(ReviewFilter filter)
        {
            if (filter.CourseId.HasValue && filter.UserId.HasValue && filter.Rating.HasValue)
            {
                return r => r.CourseId == filter.CourseId.Value
                          && r.UserId == filter.UserId.Value
                          && r.Rating == filter.Rating.Value;
            }
            else if (filter.CourseId.HasValue && filter.UserId.HasValue)
            {
                return r => r.CourseId == filter.CourseId.Value && r.UserId == filter.UserId.Value;
            }
            else if (filter.CourseId.HasValue && filter.Rating.HasValue)
            {
                return r => r.CourseId == filter.CourseId.Value && r.Rating == filter.Rating.Value;
            }
            else if (filter.UserId.HasValue && filter.Rating.HasValue)
            {
                return r => r.UserId == filter.UserId.Value && r.Rating == filter.Rating.Value;
            }
            else if (filter.CourseId.HasValue)
            {
                return r => r.CourseId == filter.CourseId.Value;
            }
            else if (filter.UserId.HasValue)
            {
                return r => r.UserId == filter.UserId.Value;
            }
            else if (filter.Rating.HasValue)
            {
                return r => r.Rating == filter.Rating.Value;
            }

            return null;
        }

        private static ReviewResponse MapToResponse(Review review)
        {
            return new ReviewResponse
            {
                Id = review.Id,
                UserId = review.UserId,
                UserFirstName = review.User?.FirstName ?? string.Empty,
                UserLastName = review.User?.LastName ?? string.Empty,
                CourseId = review.CourseId,
                CourseName = review.Course?.Name,
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewedAt = review.ReviewedAt,
                CreatedAt = review.CreatedAt
            };
        }
    }
}
