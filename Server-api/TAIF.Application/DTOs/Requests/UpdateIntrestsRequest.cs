using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateIntrestsRequest
    {
        [Required(ErrorMessage = "Interests list is required.")]
        public List<Guid> Interests { get; set; } = new();
    }
}
