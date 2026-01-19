using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseRepository _repository;

        public CourseController(ICourseRepository repository)
        {
            _repository = repository;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            var course = new Course { Name = request.Name };
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
