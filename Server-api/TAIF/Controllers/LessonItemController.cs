using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonItemController : ControllerBase
    {
        private readonly ILessonItemRepository _service;

        public LessonItemController(ILessonItemRepository service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LessonItemRequest request)
        {
            var lessonItem = new LessonItem
            {
                Name = request.Name,
                URL = request.URL,
                Content = request.Content,
                Type = request.Type,
                LessonId = request.LessonId
            };
            var created = await _service.CreateAsync(lessonItem);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] LessonItemRequest request)
        {
            var lessonItem = new LessonItem
            {
                Id = id,
                Name = request.Name,
                URL = request.URL,
                Content = request.Content,
                Type = request.Type
            };
            var updated = await _service.UpdateAsync(lessonItem);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}