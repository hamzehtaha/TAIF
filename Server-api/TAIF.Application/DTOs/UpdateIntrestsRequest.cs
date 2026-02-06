using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs
{
    public class UpdateIntrestsRequest
    {
        [Required]
        public List<Guid> Interests {  get; set; }
    }
}
