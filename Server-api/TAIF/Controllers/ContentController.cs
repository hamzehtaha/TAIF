using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            return Ok(ApiResponse<List<CourseLessonResponse>>.SuccessResponse(
                courseLessons.Select(cl => cl.Adapt<CourseLessonResponse>()).ToList()));
        }

        [HttpPost("courses/{courseId}/lessons/{lessonId}")]
        public async Task<IActionResult> AssignLessonToCourse(
            [FromRoute] Guid courseId,
            [FromRoute] Guid lessonId,
            [FromBody] UpdateOrderRequest? request = null)
        {
            var courseLesson = await _courseLessonService.AssignLessonToCourseAsync(
                courseId, lessonId, request?.NewOrder);
            return Ok(ApiResponse<CourseLessonResponse>.SuccessResponse(courseLesson.Adapt<CourseLessonResponse>()));
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

        [HttpPut("courses/{courseId}/lessons/reorder")]
        public async Task<IActionResult> BulkReorderCourseLessons(
            [FromRoute] Guid courseId,
            [FromBody] BulkReorderRequest request)
        {
            var items = request.Items.Select(i => (i.Id, i.Order)).ToList();
            var result = await _courseLessonService.BulkReorderAsync(courseId, items);
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        #endregion

        #region Lesson-LessonItem Assignment APIs

        [HttpGet("lessons/{lessonId}/items")]
        public async Task<IActionResult> GetLessonItems([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonLessonItemService.GetByLessonIdAsync(lessonId);
            var response = lessonItems.Select(lli => lli.Adapt<LessonLessonItemResponse>()).ToList();
            return Ok(ApiResponse<List<LessonLessonItemResponse>>.SuccessResponse(response));
        }

        [HttpPost("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> AssignLessonItemToLesson(
            [FromRoute] Guid lessonId,
            [FromRoute] Guid lessonItemId,
            [FromBody] UpdateOrderRequest? request = null)
        {
            try
            {
                var lessonLessonItem = await _lessonLessonItemService.AssignLessonItemToLessonAsync(
                    lessonId, lessonItemId, request?.NewOrder);

                return Ok(ApiResponse<LessonLessonItemResponse>.SuccessResponse(
                    lessonLessonItem.Adapt<LessonLessonItemResponse>()));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.FailResponse(ex.Message));
            }
        }

        [HttpDelete("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> UnassignLessonItemFromLesson(
            [FromRoute] Guid lessonId,
            [FromRoute] Guid lessonItemId)
        {
            var result = await _lessonLessonItemService.UnassignLessonItemFromLessonAsync(lessonId, lessonItemId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpPut("lessons/{lessonId}/items/{lessonItemId}/order")]
        public async Task<IActionResult> UpdateLessonItemOrder(
            [FromRoute] Guid lessonId,
            [FromRoute] Guid lessonItemId,
            [FromBody] UpdateOrderRequest request)
        {
            var result = await _lessonLessonItemService.UpdateOrderAsync(lessonId, lessonItemId, request.NewOrder);
            if (result == null) return NotFound(ApiResponse<string>.FailResponse("LessonItem assignment not found"));
            return Ok(ApiResponse<LessonLessonItemResponse>.SuccessResponse(
                result.Adapt<LessonLessonItemResponse>()));
        }

        [HttpPut("lessons/{lessonId}/items/reorder")]
        public async Task<IActionResult> BulkReorderLessonItems(
            [FromRoute] Guid lessonId,
            [FromBody] BulkReorderRequest request)
        {
            var items = request.Items.Select(i => (i.Id, i.Order)).ToList();
            var result = await _lessonLessonItemService.BulkReorderAsync(lessonId, items);
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        #endregion

        #region Content APIs

        [HttpPost]
        public async Task<IActionResult> CreateContent([FromBody] CreateContentRequest request)
        {
            Content content = await _contentService.CreateAsync(request, this.OrganizationId!.Value);
            if (content is null) return BadRequest(ApiResponse<ContentResponse>.FailResponse("Failed to create content"));
            return Ok(ApiResponse<ContentResponse>.SuccessResponse(content.Adapt<ContentResponse>()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContent([FromRoute] Guid id)
        {
            var content = await _contentService.GetByIdAsync(id);
            if (content is null) return NotFound(ApiResponse<ContentResponse>.FailResponse("Content not found"));
            return Ok(ApiResponse<ContentResponse>.SuccessResponse(content.Adapt<ContentResponse>()));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllContent()
        {
            var contents = await _contentService.GetAllAsync();
            return Ok(ApiResponse<List<ContentResponse>>.SuccessResponse(
                contents.Select(c => c.Adapt<ContentResponse>()).ToList()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContent([FromRoute] Guid id, [FromBody] UpdateContentRequest request)
        {
            try
            {
                var content = await _contentService.UpdateAsync(id, request);
                return Ok(ApiResponse<ContentResponse>.SuccessResponse(content.Adapt<ContentResponse>()));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<ContentResponse>.FailResponse(ex.Message));
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
