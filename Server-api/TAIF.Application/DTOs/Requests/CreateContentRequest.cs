using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateContentRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Content type is required.")]
        [EnumDataType(typeof(LessonItemType), ErrorMessage = "Type must be a valid content type.")]
        public LessonItemType Type { get; set; }

        public Video? Video { get; set; }
        public RichText? RichText { get; set; }
        public QuizCreateDto? Quiz { get; set; }
        public Guid? OrganizationId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Type == LessonItemType.Video && Video is null)
                yield return new ValidationResult(
                    "Video data is required when type is Video.",
                    new[] { nameof(Video) });

            if (Type == LessonItemType.RichText && RichText is null)
                yield return new ValidationResult(
                    "RichText data is required when type is RichText.",
                    new[] { nameof(RichText) });

            if (Type == LessonItemType.Quiz && Quiz is null)
                yield return new ValidationResult(
                    "Quiz data is required when type is Quiz.",
                    new[] { nameof(Quiz) });
        }
    }

    public record QuizCreateDto
    {
        [Required(ErrorMessage = "Quiz title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Quiz title must be between 2 and 300 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "At least one question is required.")]
        [MinLength(1, ErrorMessage = "A quiz must have at least one question.")]
        public List<QuizQuestionCreateDto> Questions { get; set; } = new();
    }

    public record QuizQuestionCreateDto
    {
        public string? Id { get; set; } // Optional - sent only when editing

        [Required(ErrorMessage = "Question text is required.")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Question text must be between 1 and 1000 characters.")]
        public string QuestionText { get; set; } = string.Empty;

        public bool ShuffleOptions { get; set; } = false;

        [Required(ErrorMessage = "At least two options are required.")]
        [MinLength(2, ErrorMessage = "A question must have at least two options.")]
        public List<QuizOptionDto> Options { get; set; } = new();

        public string? CorrectAnswerId { get; set; }    // For editing
        public int? CorrectAnswerIndex { get; set; }    // For creating

        [StringLength(1000, ErrorMessage = "Explanation must not exceed 1000 characters.")]
        public string? Explanation { get; set; }
    }

    public record QuizOptionDto
    {
        public string? Id { get; set; } // Optional - sent only when editing

        [Required(ErrorMessage = "Option text is required.")]
        [StringLength(500, MinimumLength = 1, ErrorMessage = "Option text must be between 1 and 500 characters.")]
        public string Text { get; set; } = string.Empty;
    }
}
