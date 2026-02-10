using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateCategoryRequest
    {
        [Required]
        public string Name { get; set; } = null!;
    }
}
