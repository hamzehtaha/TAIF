using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Repositories;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonController : ControllerBase
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonItemRepository _lessonItemRepository;

        public LessonController(ILessonRepository lessonRepository, ILessonItemRepository lessonItemRepository)
        {
            _lessonRepository = lessonRepository;
            _lessonItemRepository = lessonItemRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _lessonRepository.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _lessonRepository.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpGet("{lessonId}/content")]
        public async Task<IActionResult> GetLessonContent(Guid lessonId)
        {
            var items = await _lessonItemRepository.GetByLessonIdAsync(lessonId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LessonRequest request)
        {
            var lesson = new Lesson
            {
                Title = request.Title,
                URL = request.URL,
                CourseId = request.CourseId,
                Photo = request.Photo
            };
            var created = await _lessonRepository.CreateAsync(lesson);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] LessonRequest request)
        {
            var lesson = new Lesson
            {
                Id = id,
                Title = request.Title,
                URL = request.URL,
                CourseId = request.CourseId,
                Photo = request.Photo
            };
            var updated = await _lessonRepository.UpdateAsync(lesson);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _lessonRepository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}