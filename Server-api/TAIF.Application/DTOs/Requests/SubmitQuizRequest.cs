using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record SubmitQuizRequest
    {
        [Required(ErrorMessage = "Lesson item ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson item ID must not be an empty GUID.")]
        public Guid LessonItemId { get; set; }

        [Required(ErrorMessage = "Lesson ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson ID must not be an empty GUID.")]
        public Guid LessonId { get; set; }

        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Answers are required.")]
        [MinLength(1, ErrorMessage = "At least one answer must be submitted.")]
        public List<QuizAnswerRequest> Answers { get; set; } = new();
    }
}
