using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{

    [ApiController]
    [Route("api/content")]
    [Authorize(Policy = "ContentCreatorOrAbove")]
    public class ContentController : TaifControllerBase
    {
        private readonly ICourseLessonService _courseLessonService;
        private readonly ILessonLessonItemService _lessonLessonItemService;
        private IContentService _contentService;
        public ContentController(
            ICourseLessonService courseLessonService,
            ILessonLessonItemService lessonLessonItemService,
            IContentService contentService)
        {
            _courseLessonService = courseLessonService;
            _lessonLessonItemService = lessonLessonItemService;
            _contentService = contentService;
        }

        #region Course-Lesson Assignment APIs

        [HttpGet("courses/{courseId}/lessons")]
        public async Task<IActionResult> GetCourseLessons([FromRoute] Guid courseId)
        {
            var courseLessons = await _courseLessonService.GetByCourseIdAsync(courseId);
            return Ok(ApiResponse<List<CourseLesson>>.SuccessResponse(courseLessons));
        }

        [HttpPost("courses/{courseId}/lessons/{lessonId}")]
        public async Task<IActionResult> AssignLessonToCourse(
            [FromRoute] Guid courseId,
            [FromRoute] Guid lessonId,
            [FromBody] UpdateOrderRequest? request = null)
        {
            var courseLesson = await _courseLessonService.AssignLessonToCourseAsync(
                courseId, lessonId, request?.NewOrder);
            return Ok(ApiResponse<CourseLesson>.SuccessResponse(courseLesson));
        }

        [HttpDelete("courses/{courseId}/lessons/{lessonId}")]
        public async Task<IActionResult> UnassignLessonFromCourse(
            [FromRoute] Guid courseId,
            [FromRoute] Guid lessonId)
        {
            var result = await _courseLessonService.UnassignLessonFromCourseAsync(courseId, lessonId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpPut("courses/{courseId}/lessons/{lessonId}/order")]
        public async Task<IActionResult> UpdateCourseLessonOrder(
            [FromRoute] Guid courseId,
            [FromRoute] Guid lessonId,
            [FromBody] UpdateOrderRequest request)
        {
            var result = await _courseLessonService.UpdateOrderAsync(courseId, lessonId, request.NewOrder);
            if (!result) return NotFound(ApiResponse<string>.FailResponse("Lesson assignment not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }

        #endregion

        #region Lesson-LessonItem Assignment APIs

        [HttpGet("lessons/{lessonId}/items")]
        public async Task<IActionResult> GetLessonItems([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonLessonItemService.GetByLessonIdAsync(lessonId);
            var response = lessonItems.Select(lli => new LessonLessonItemResponse
            {
                Id = lli.Id,
                LessonId = lli.LessonId,
                LessonItemId = lli.LessonItemId,
                Order = lli.Order,
                LessonItemName = lli.LessonItem?.Name,
                LessonItemType = lli.LessonItem != null ? (int)lli.LessonItem.Type : null
            }).ToList();
            return Ok(ApiResponse<List<LessonLessonItemResponse>>.SuccessResponse(response));
        }

        [HttpPost("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> AssignLessonItemToLesson([FromRoute] Guid lessonId, [FromRoute] Guid lessonItemId, [FromBody] UpdateOrderRequest? request = null)
        {
            try
            {
                var lessonLessonItem = await _lessonLessonItemService.AssignLessonItemToLessonAsync(
                    lessonId, lessonItemId, request?.NewOrder);
                var response = new LessonLessonItemResponse
                {
                    Id = lessonLessonItem.Id,
                    LessonId = lessonLessonItem.LessonId,
                    LessonItemId = lessonLessonItem.LessonItemId,
                    Order = lessonLessonItem.Order
                };
                return Ok(ApiResponse<LessonLessonItemResponse>.SuccessResponse(response));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.FailResponse(ex.Message));
            }
        }

        [HttpDelete("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> UnassignLessonItemFromLesson([FromRoute] Guid lessonId, [FromRoute] Guid lessonItemId)
        {
            var result = await _lessonLessonItemService.UnassignLessonItemFromLessonAsync(lessonId, lessonItemId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpPut("lessons/{lessonId}/items/{lessonItemId}/order")]
        public async Task<IActionResult> UpdateLessonItemOrder([FromRoute] Guid lessonId, [FromRoute] Guid lessonItemId, [FromBody] UpdateOrderRequest request)
        {
            var result = await _lessonLessonItemService.UpdateOrderAsync(lessonId, lessonItemId, request.NewOrder);
            if (result == null) return NotFound(ApiResponse<string>.FailResponse("LessonItem assignment not found"));
            var response = new LessonLessonItemResponse
            {
                Id = result.Id,
                LessonId = result.LessonId,
                LessonItemId = result.LessonItemId,
                Order = result.Order
            };
            return Ok(ApiResponse<LessonLessonItemResponse>.SuccessResponse(response));
        }

        #endregion

        #region Content APIs

        [HttpPost]
        public async Task<IActionResult> CreateContent([FromBody] CreateContentRequest request)
        {
            Content content = await _contentService.CreateAsync(request, this.OrganizationId);
            if (content is null) return BadRequest(ApiResponse<Content>.FailResponse("Failed to create content"));
            return Ok(ApiResponse<Content>.SuccessResponse(content));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContent([FromRoute] Guid id)
        {
            var content = await _contentService.GetByIdAsync(id);
            if (content is null) return NotFound(ApiResponse<Content>.FailResponse("Content not found"));
            return Ok(ApiResponse<Content>.SuccessResponse(content));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllContent()
        {
            var contents = await _contentService.GetAllAsync();
            return Ok(ApiResponse<List<Content>>.SuccessResponse(contents.ToList()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContent([FromRoute] Guid id, [FromBody] CreateContentRequest request)
        {
            try
            {
                var content = await _contentService.UpdateAsync(id, request);
                return Ok(ApiResponse<Content>.SuccessResponse(content));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<Content>.FailResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContent([FromRoute] Guid id)
        {
            var result = await _contentService.DeleteAsync(id);
            if (!result) return NotFound(ApiResponse<bool>.FailResponse("Content not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        #endregion
    }
}
