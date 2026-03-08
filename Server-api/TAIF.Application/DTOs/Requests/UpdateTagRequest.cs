using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateTagRequest
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Tag name must be between 2 and 100 characters.")]
        public string? Name { get; set; }
    }
}
