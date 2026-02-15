using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record EnrollLearningPathRequest
    {
        [Required]
        public Guid LearningPathId { get; set; }
    }
}