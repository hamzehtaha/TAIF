using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs
{
    public class CreateCategoryRequest
    {
        [Required]
        public string Name { get; set; } = null!;
    }
}
