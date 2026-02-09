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
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryController : TaifControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            if (categories is null) return NotFound();
            return Ok(ApiResponse<List<Category>>.SuccessResponse(categories));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category is null) return NotFound();
            return Ok(ApiResponse<Category>.SuccessResponse(category));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
        {
            var category = new Category
            {
                Name = request.Name
            };
            var created_category = await _categoryService.CreateAsync(category);
            return Ok(ApiResponse<Category>.SuccessResponse(created_category));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCategoryRequest category)
        {
            var Category = await _categoryService.UpdateAsync(id, category);
            return Ok(ApiResponse<Category>.SuccessResponse(Category));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _categoryService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
