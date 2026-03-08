using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class LessonFilter : BaseFilter, IValidatableObject
    {
        [StringLength(200, ErrorMessage = "Search term must not exceed 200 characters.")]
        public string? Search { get; set; }

        public Guid? CourseId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "MinOrder must be at least 1.")]
        public int? MinOrder { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "MaxOrder must be at least 1.")]
        public int? MaxOrder { get; set; }

        public bool? HasItems { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (MinOrder.HasValue && MaxOrder.HasValue && MinOrder > MaxOrder)
                yield return new ValidationResult(
                    "MinOrder must be less than or equal to MaxOrder.",
                    new[] { nameof(MinOrder), nameof(MaxOrder) });
        }
    }
}
