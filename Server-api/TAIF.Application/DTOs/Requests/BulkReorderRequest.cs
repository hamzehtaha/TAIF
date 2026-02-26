using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class BulkReorderRequest
{
    [Required]
    public List<ReorderItem> Items { get; set; } = new();
}

public class ReorderItem
{
    [Required]
    public Guid Id { get; set; }
    
    [Required]
    public int Order { get; set; }
}
