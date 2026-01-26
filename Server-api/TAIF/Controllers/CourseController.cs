using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.Metrics;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Repositories;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;


        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Course>>> GetAll()
        {
            return await _courseService.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> Get(Guid id)
        {
            var course = await _courseService.GetByIdAsync(id);
            if (course == null) return NotFound();
            return course;
        }

        //[HttpGet("{id}/content")]
        //public async Task<IActionResult> GetCourseContent(int id)
        //{
        //    var lessonItems = await _lessonItemRepository.GetByCourseIdAsync(id);
        //    return Ok(lessonItems);
        //}

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo
            };
            var created_course = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<Course>.SuccessResponse(created_course));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Course course)
        {
            if (id != course.Id) return BadRequest();
            var result = await _courseService.UpdateAsync(course);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _courseService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
