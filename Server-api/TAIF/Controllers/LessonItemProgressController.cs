using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LessonItemProgressController : TaifControllerBase
    {
        private readonly ILessonItemProgressService _lessonItemProgressService;
        public LessonItemProgressController(ILessonItemProgressService lessonItemProgressService)
        {
            _lessonItemProgressService = lessonItemProgressService;
        }
        [HttpPost]
        public async Task<IActionResult> SetLessonItemAsCompleted([FromBody] SetLessonItemAsCompletedRequest request)
        {
            LessonItemProgress lessonItemProgress = await _lessonItemProgressService.SetLessonItemAsCompleted(this.UserId, request);
            return Ok(ApiResponse<LessonItemProgress>.SuccessResponse(lessonItemProgress));
        }
    }
}
