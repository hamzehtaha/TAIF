using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateCategoryRequest
    {
        public string? Name { get; set; }
    }
}
