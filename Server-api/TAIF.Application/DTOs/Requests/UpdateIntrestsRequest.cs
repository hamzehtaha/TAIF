using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateIntrestsRequest
    {
        public List<Guid> Interests {  get; set; }
    }
}
