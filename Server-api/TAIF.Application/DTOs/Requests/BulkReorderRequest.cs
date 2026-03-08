using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests;

public class BulkReorderRequest
{
    [Required(ErrorMessage = "Items list is required.")]
    [MinLength(1, ErrorMessage = "At least one item must be provided.")]
    public List<ReorderItem> Items { get; set; } = new();
}

public class ReorderItem
{
    [Required(ErrorMessage = "Item ID is required.")]
    [NonEmptyGuid(ErrorMessage = "Item ID must not be an empty GUID.")]
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Order value is required.")]
    [Range(0, int.MaxValue, ErrorMessage = "Order must be zero or a positive number.")]
    public int Order { get; set; }
}
