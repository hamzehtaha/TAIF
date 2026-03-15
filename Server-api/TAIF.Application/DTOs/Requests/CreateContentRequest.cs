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
}
