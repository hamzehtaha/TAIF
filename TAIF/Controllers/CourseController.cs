using Microsoft.AspNetCore.Mvc;
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
        private readonly ICourseRepository _repository;
        private readonly ILessonItemRepository _lessonItemRepository;


        public CourseController(ICourseRepository courseRepository, ILessonItemRepository lessonItemRepository)
        {
            _repository = courseRepository;
            _lessonItemRepository = lessonItemRepository;
        }

        [HttpGet]
        public async Task<ActionResult<List<Course>>> GetAll()
        {
            return await _repository.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> Get(int id)
        {
            var course = await _repository.GetByIdAsync(id);
            if (course == null) return NotFound();
            return course;
        }

        [HttpGet("{id}/content")]
        public async Task<IActionResult> GetCourseContent(int id)
        {
            var lessonItems = await _lessonItemRepository.GetByCourseIdAsync(id);
            return Ok(lessonItems);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo
            };
            var created = await _repository.CreateAsync(course);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Course course)
        {
            if (id != course.Id) return BadRequest();
            var result = await _repository.UpdateAsync(course);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
