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
    /// <summary>
    /// Content Creator Portal API - Manages courses, lessons, lesson items and their assignments
    /// Accessible by Admin, ContentCreator and SuperAdmin roles
    /// </summary>
    [ApiController]
    [Route("api/content-creator")]
    [Authorize(Policy = "ContentCreatorOrAbove")]
    public class ContentCreatorController : TaifControllerBase
    {
        private readonly ICourseLessonService _courseLessonService;
        private readonly ILessonLessonItemService _lessonLessonItemService;
        private readonly IVideoService _videoService;
        private readonly IRichContentService _richContentService;
        private readonly IQuestionService _questionService;
        private readonly ILessonService _lessonService;
        private readonly ILessonItemService _lessonItemService;

        public ContentCreatorController(
            ICourseLessonService courseLessonService,
            ILessonLessonItemService lessonLessonItemService,
            IVideoService videoService,
            IRichContentService richContentService,
            IQuestionService questionService,
            ILessonService lessonService,
            ILessonItemService lessonItemService)
        {
            _courseLessonService = courseLessonService;
            _lessonLessonItemService = lessonLessonItemService;
            _videoService = videoService;
            _richContentService = richContentService;
            _questionService = questionService;
            _lessonService = lessonService;
            _lessonItemService = lessonItemService;
        }

        #region Course-Lesson Assignment APIs

        /// <summary>
        /// Get all lessons assigned to a course
        /// </summary>
        [HttpGet("courses/{courseId}/lessons")]
        public async Task<IActionResult> GetCourseLessons([FromRoute] Guid courseId)
        {
            var courseLessons = await _courseLessonService.GetByCourseIdAsync(courseId);
            return Ok(ApiResponse<List<CourseLesson>>.SuccessResponse(courseLessons));
        }

        /// <summary>
        /// Get all courses a lesson is assigned to
        /// </summary>
        [HttpGet("lessons/{lessonId}/courses")]
        public async Task<IActionResult> GetLessonCourses([FromRoute] Guid lessonId)
        {
            var courseLessons = await _courseLessonService.GetByLessonIdAsync(lessonId);
            return Ok(ApiResponse<List<CourseLesson>>.SuccessResponse(courseLessons));
        }

        /// <summary>
        /// Assign a lesson to a course
        /// </summary>
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

        /// <summary>
        /// Unassign a lesson from a course
        /// </summary>
        [HttpDelete("courses/{courseId}/lessons/{lessonId}")]
        public async Task<IActionResult> UnassignLessonFromCourse(
            [FromRoute] Guid courseId, 
            [FromRoute] Guid lessonId)
        {
            var result = await _courseLessonService.UnassignLessonFromCourseAsync(courseId, lessonId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        /// <summary>
        /// Update the order of a lesson within a course
        /// </summary>
        [HttpPatch("courses/{courseId}/lessons/{lessonId}/order")]
        public async Task<IActionResult> UpdateLessonOrder(
            [FromRoute] Guid courseId, 
            [FromRoute] Guid lessonId,
            [FromBody] UpdateOrderRequest request)
        {
            var result = await _courseLessonService.UpdateOrderAsync(courseId, lessonId, request.NewOrder);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        #endregion

        #region Lesson-LessonItem Assignment APIs

        /// <summary>
        /// Get all lesson items assigned to a lesson
        /// </summary>
        [HttpGet("lessons/{lessonId}/items")]
        public async Task<IActionResult> GetLessonItems([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonLessonItemService.GetByLessonIdAsync(lessonId);
            return Ok(ApiResponse<List<LessonLessonItem>>.SuccessResponse(lessonItems));
        }

        /// <summary>
        /// Get all lessons a lesson item is assigned to
        /// </summary>
        [HttpGet("items/{lessonItemId}/lessons")]
        public async Task<IActionResult> GetItemLessons([FromRoute] Guid lessonItemId)
        {
            var lessonItems = await _lessonLessonItemService.GetByLessonItemIdAsync(lessonItemId);
            return Ok(ApiResponse<List<LessonLessonItem>>.SuccessResponse(lessonItems));
        }

        /// <summary>
        /// Assign a lesson item to a lesson
        /// </summary>
        [HttpPost("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> AssignLessonItemToLesson(
            [FromRoute] Guid lessonId, 
            [FromRoute] Guid lessonItemId,
            [FromBody] UpdateOrderRequest? request = null)
        {
            var lessonLessonItem = await _lessonLessonItemService.AssignLessonItemToLessonAsync(
                lessonId, lessonItemId, request?.NewOrder);
            return Ok(ApiResponse<LessonLessonItem>.SuccessResponse(lessonLessonItem));
        }

        /// <summary>
        /// Unassign a lesson item from a lesson
        /// </summary>
        [HttpDelete("lessons/{lessonId}/items/{lessonItemId}")]
        public async Task<IActionResult> UnassignLessonItemFromLesson(
            [FromRoute] Guid lessonId, 
            [FromRoute] Guid lessonItemId)
        {
            var result = await _lessonLessonItemService.UnassignLessonItemFromLessonAsync(lessonId, lessonItemId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        /// <summary>
        /// Update the order of a lesson item within a lesson
        /// </summary>
        [HttpPatch("lessons/{lessonId}/items/{lessonItemId}/order")]
        public async Task<IActionResult> UpdateLessonItemOrder(
            [FromRoute] Guid lessonId, 
            [FromRoute] Guid lessonItemId,
            [FromBody] UpdateOrderRequest request)
        {
            var result = await _lessonLessonItemService.UpdateOrderAsync(lessonId, lessonItemId, request.NewOrder);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        #endregion

        #region Video Content APIs

        /// <summary>
        /// Create a new video
        /// </summary>
        [HttpPost("videos")]
        public async Task<IActionResult> CreateVideo([FromBody] CreateVideoRequest request)
        {
            var video = new Video
            {
                Title = request.Title,
                Description = request.Description,
                Url = request.Url,
                ThumbnailUrl = request.ThumbnailUrl,
                DurationInSeconds = request.DurationInSeconds,
                LessonItemId = request.LessonItemId
            };

            var createdVideo = await _videoService.CreateAsync(video);
            return Ok(ApiResponse<Video>.SuccessResponse(createdVideo));
        }

        /// <summary>
        /// Get video by lesson item ID
        /// </summary>
        [HttpGet("items/{lessonItemId}/video")]
        public async Task<IActionResult> GetVideoByLessonItem([FromRoute] Guid lessonItemId)
        {
            var video = await _videoService.GetByLessonItemIdAsync(lessonItemId);
            if (video == null) return NotFound();
            return Ok(ApiResponse<Video>.SuccessResponse(video));
        }

        /// <summary>
        /// Create video and assign to lesson item
        /// </summary>
        [HttpPost("items/{lessonItemId}/video")]
        public async Task<IActionResult> CreateAndAssignVideo(
            [FromRoute] Guid lessonItemId,
            [FromBody] CreateVideoRequest request)
        {
            var video = new Video
            {
                Title = request.Title,
                Description = request.Description,
                Url = request.Url,
                ThumbnailUrl = request.ThumbnailUrl,
                DurationInSeconds = request.DurationInSeconds
            };

            var createdVideo = await _videoService.CreateAndAssignToLessonItemAsync(video, lessonItemId);
            return Ok(ApiResponse<Video>.SuccessResponse(createdVideo));
        }

        #endregion

        #region Rich Content APIs

        /// <summary>
        /// Create new rich content
        /// </summary>
        [HttpPost("rich-contents")]
        public async Task<IActionResult> CreateRichContent([FromBody] CreateRichContentRequest request)
        {
            var richContent = new RichContent
            {
                Title = request.Title,
                Description = request.Description,
                Content = request.Content,
                ContentType = request.ContentType,
                LessonItemId = request.LessonItemId
            };

            var createdContent = await _richContentService.CreateAsync(richContent);
            return Ok(ApiResponse<RichContent>.SuccessResponse(createdContent));
        }

        /// <summary>
        /// Get rich content by lesson item ID
        /// </summary>
        [HttpGet("items/{lessonItemId}/rich-content")]
        public async Task<IActionResult> GetRichContentByLessonItem([FromRoute] Guid lessonItemId)
        {
            var richContent = await _richContentService.GetByLessonItemIdAsync(lessonItemId);
            if (richContent == null) return NotFound();
            return Ok(ApiResponse<RichContent>.SuccessResponse(richContent));
        }

        /// <summary>
        /// Create rich content and assign to lesson item
        /// </summary>
        [HttpPost("items/{lessonItemId}/rich-content")]
        public async Task<IActionResult> CreateAndAssignRichContent(
            [FromRoute] Guid lessonItemId,
            [FromBody] CreateRichContentRequest request)
        {
            var richContent = new RichContent
            {
                Title = request.Title,
                Description = request.Description,
                Content = request.Content,
                ContentType = request.ContentType
            };

            var createdContent = await _richContentService.CreateAndAssignToLessonItemAsync(richContent, lessonItemId);
            return Ok(ApiResponse<RichContent>.SuccessResponse(createdContent));
        }

        #endregion

        #region Question APIs

        /// <summary>
        /// Create a new question
        /// </summary>
        [HttpPost("questions")]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionRequest request)
        {
            var question = new Question
            {
                Text = request.Text,
                CorrectAnswerIndex = request.CorrectAnswerIndex,
                Explanation = request.Explanation,
                Points = request.Points,
                Order = request.Order ?? 0,
                LessonItemId = request.LessonItemId
            };
            question.SetOptionsList(request.Options);

            var createdQuestion = await _questionService.CreateAsync(question);
            return Ok(ApiResponse<Question>.SuccessResponse(createdQuestion));
        }

        /// <summary>
        /// Get questions by lesson item ID
        /// </summary>
        [HttpGet("items/{lessonItemId}/questions")]
        public async Task<IActionResult> GetQuestionsByLessonItem([FromRoute] Guid lessonItemId)
        {
            var questions = await _questionService.GetByLessonItemIdAsync(lessonItemId);
            return Ok(ApiResponse<List<Question>>.SuccessResponse(questions));
        }

        /// <summary>
        /// Create question and assign to lesson item (quiz)
        /// </summary>
        [HttpPost("items/{lessonItemId}/questions")]
        public async Task<IActionResult> CreateAndAssignQuestion(
            [FromRoute] Guid lessonItemId,
            [FromBody] CreateQuestionRequest request)
        {
            var question = new Question
            {
                Text = request.Text,
                CorrectAnswerIndex = request.CorrectAnswerIndex,
                Explanation = request.Explanation,
                Points = request.Points,
                Order = request.Order ?? 0
            };
            question.SetOptionsList(request.Options);

            var createdQuestion = await _questionService.CreateAndAssignToLessonItemAsync(question, lessonItemId);
            return Ok(ApiResponse<Question>.SuccessResponse(createdQuestion));
        }

        /// <summary>
        /// Bulk create questions and assign to lesson item (quiz)
        /// </summary>
        [HttpPost("items/{lessonItemId}/questions/bulk")]
        public async Task<IActionResult> BulkCreateAndAssignQuestions(
            [FromRoute] Guid lessonItemId,
            [FromBody] List<CreateQuestionRequest> requests)
        {
            var questions = requests.Select(r =>
            {
                var q = new Question
                {
                    Text = r.Text,
                    CorrectAnswerIndex = r.CorrectAnswerIndex,
                    Explanation = r.Explanation,
                    Points = r.Points,
                    Order = r.Order ?? 0
                };
                q.SetOptionsList(r.Options);
                return q;
            }).ToList();

            var createdQuestions = await _questionService.CreateBulkAndAssignToLessonItemAsync(questions, lessonItemId);
            return Ok(ApiResponse<List<Question>>.SuccessResponse(createdQuestions));
        }

        #endregion
    }
}
