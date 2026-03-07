using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Filters
{
    public class LessonItemFilter : BaseFilter
    {
        [StringLength(200, ErrorMessage = "Search term must not exceed 200 characters.")]
        public string? Search { get; set; }

        public Guid? LessonId { get; set; }
        public Guid? CourseId { get; set; }

        [EnumDataType(typeof(LessonItemType), ErrorMessage = "Type must be a valid lesson item type.")]
        public LessonItemType? Type { get; set; }
    }
}
