using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    [Authorize]
    public class ReviewController : TaifControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(ApiResponse<object>.FailResponse("Rating must be between 1 and 5"));
            }

            var hasReviewed = await _reviewService.HasUserReviewedCourseAsync(this.UserId, dto.CourseId);
            if (hasReviewed)
            {
                return BadRequest(ApiResponse<object>.FailResponse("You have already reviewed this course"));
            }

            var review = await _reviewService.CreateAsync(
                new Review
                {
                    UserId = this.UserId,
                    CourseId = dto.CourseId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ReviewedAt = DateTime.UtcNow
                }
            );

            return Ok(ApiResponse<Review>.SuccessResponse(review, "Review created successfully"));
        }

        [HttpPut("{reviewId}")]
        public async Task<IActionResult> UpdateReview([FromRoute] Guid reviewId, [FromBody] UpdateReviewRequest dto)
        {
            var existingReview = await _reviewService.GetByIdAsync(reviewId);
            if (existingReview == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("Review not found"));
            }

            if (existingReview.UserId != this.UserId)
            {
                return Forbid();
            }

            if (dto.Rating.HasValue && (dto.Rating < 1 || dto.Rating > 5))
            {
                return BadRequest(ApiResponse<object>.FailResponse("Rating must be between 1 and 5"));
            }

            var updatedReview = await _reviewService.UpdateAsync(reviewId, dto);
            return Ok(ApiResponse<Review>.SuccessResponse(updatedReview, "Review updated successfully"));
        }

        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview([FromRoute] Guid reviewId)
        {
            var existingReview = await _reviewService.GetByIdAsync(reviewId);
            if (existingReview == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("Review not found"));
            }

            if (existingReview.UserId != this.UserId)
            {
                return Forbid();
            }

            var result = await _reviewService.DeleteAsync(reviewId);
            return Ok(ApiResponse<bool>.SuccessResponse(result, "Review deleted successfully"));
        }

        [HttpGet("{reviewId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewById([FromRoute] Guid reviewId)
        {
            var review = await _reviewService.GetByIdAsync(reviewId);
            if (review == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("Review not found"));
            }

            return Ok(ApiResponse<Review>.SuccessResponse(review));
        }

        [HttpGet("course/{courseId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCourseReviews([FromRoute] Guid courseId)
        {
            var reviews = await _reviewService.GetCourseReviewsAsync(courseId);
            return Ok(ApiResponse<List<ReviewResponse>>.SuccessResponse(reviews));
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserReviews()
        {
            var reviews = await _reviewService.GetUserReviewsAsync(this.UserId);
            return Ok(ApiResponse<List<ReviewResponse>>.SuccessResponse(reviews));
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserReviewsById([FromRoute] Guid userId)
        {
            var reviews = await _reviewService.GetUserReviewsAsync(userId);
            return Ok(ApiResponse<List<ReviewResponse>>.SuccessResponse(reviews));
        }

        [HttpGet("course/{courseId}/statistics")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCourseReviewStatistics([FromRoute] Guid courseId)
        {
            var statistics = await _reviewService.GetCourseReviewStatisticsAsync(courseId);
            return Ok(ApiResponse<ReviewStatisticsResponse>.SuccessResponse(statistics));
        }

        [HttpGet("course/{courseId}/my-review")]
        public async Task<IActionResult> GetMyReviewForCourse([FromRoute] Guid courseId)
        {
            var review = await _reviewService.GetUserReviewForCourseAsync(this.UserId, courseId);
            if (review == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("You have not reviewed this course"));
            }

            return Ok(ApiResponse<Review>.SuccessResponse(review));
        }

        [HttpGet("course/{courseId}/has-reviewed")]
        public async Task<IActionResult> HasUserReviewedCourse([FromRoute] Guid courseId)
        {
            var hasReviewed = await _reviewService.HasUserReviewedCourseAsync(this.UserId, courseId);
            return Ok(ApiResponse<bool>.SuccessResponse(hasReviewed));
        }

        [HttpGet("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPagedReviews([FromQuery] ReviewFilter filter)
        {
            var pagedReviews = await _reviewService.GetPagedReviewsAsync(filter);
            return Ok(ApiResponse<PagedResult<ReviewResponse>>.SuccessResponse(pagedReviews));
        }
    }
}
