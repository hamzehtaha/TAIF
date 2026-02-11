using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LessonItemProgressController : TaifControllerBase
    {
        private readonly ILessonItemProgressService _lessonItemProgressService;
        private readonly IEnrollmentService _enrollmentService;

        public LessonItemProgressController(
            ILessonItemProgressService lessonItemProgressService,
            IEnrollmentService enrollmentService)
        {
            _lessonItemProgressService = lessonItemProgressService;
            _enrollmentService = enrollmentService;
        }

        [HttpPost]
        public async Task<IActionResult> SetLessonItemAsCompleted([FromBody] SetLessonItemAsCompletedRequest request)
        {
            LessonItemProgress lessonItemProgress = await _lessonItemProgressService.SetLessonItemAsCompleted(this.UserId, request);
            return Ok(ApiResponse<LessonItemProgress>.SuccessResponse(lessonItemProgress));
        }

        [HttpPut("UpdateLastLessonItem")]
        public async Task<IActionResult> UpdateLastLessonItem([FromBody] UpdateLastLessonItemRequest request)
        {
            await _enrollmentService.UpdateLastLessonItemId(this.UserId, request.CourseId, request.LessonItemId);
            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
