using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class CourseFilter : BaseFilter, IValidatableObject
    {
        [StringLength(200, ErrorMessage = "Search term must not exceed 200 characters.")]
        public string? Search { get; set; }

        public bool? IsActive { get; set; }
        public Guid? CategoryId { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }

        /// <summary>Filter by free (true) or paid (false) courses. Null returns all.</summary>
        public bool? IsFree { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (CreatedFrom.HasValue && CreatedTo.HasValue && CreatedFrom > CreatedTo)
                yield return new ValidationResult(
                    "CreatedFrom must be earlier than or equal to CreatedTo.",
                    new[] { nameof(CreatedFrom), nameof(CreatedTo) });
        }
    }
}
