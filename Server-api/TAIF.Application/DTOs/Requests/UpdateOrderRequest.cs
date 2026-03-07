using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class UpdateOrderRequest
{
    [Required(ErrorMessage = "New order value is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Order must be at least 1.")]
    public int NewOrder { get; set; }
}
