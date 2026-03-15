using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Filters
{
    public class BaseFilter
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be at least 1.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
        public int PageSize { get; set; } = 50;
    }
}
