using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs
{
    public record UpdateLessonItemProgressRequest
    {

        [Required]
        public Guid CourseId { get; set; }
        [Required]
        public Guid LessonID { get; set; }
        [Required]
        public Guid LessonItemId { get; set; }
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Completed duration must be a non-negative value.")]
        public double CompletedDurationInSeconds { get; set; }
    }
}
