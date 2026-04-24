using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;
using System.Collections.Generic;

namespace TAIF.Application.DTOs.Requests
{
    /// <summary>
    /// Request DTO for creating a complete course with all its lessons, lesson items, and content in one operation.
    /// Used by the Course Builder to submit all data at once.
    /// </summary>
    public record CreateFullCourseRequest
    {
        [Required(ErrorMessage = "Course name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Course name must be between 2 and 200 characters.")]
        public string Name { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        [NonEmptyGuid(ErrorMessage = "Category ID must not be an empty GUID.")]
        public Guid CategoryId { get; set; }

        public List<Guid> Tags { get; set; } = new();

        /// <summary>Whether this course is free to access without a paid subscription.</summary>
        public bool IsFree { get; set; } = false;

        /// <summary>Optional date until which the course is free. After this date it becomes paid automatically.</summary>
        public DateTime? FreeUntil { get; set; }

        [Required(ErrorMessage = "At least one lesson is required.")]
        [MinLength(1, ErrorMessage = "At least one lesson must be provided.")]
        public List<CreateFullCourseLessonRequest> Lessons { get; set; } = new();
    }

    /// <summary>
    /// Lesson data within the full course creation request.
    /// </summary>
    public record CreateFullCourseLessonRequest
    {
        /// <summary>
        /// Existing lesson ID if using a pre-created lesson.
        /// If provided, Title and other fields are optional (lesson data will be loaded from existing lesson).
        /// </summary>
        public Guid? LessonId { get; set; }

        [StringLength(200, MinimumLength = 2, ErrorMessage = "Lesson title must be between 2 and 200 characters.")]
        public string? Title { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }

        public Guid? InstructorId { get; set; }

        [Required(ErrorMessage = "Lesson order is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Order must be a non-negative number.")]
        public int Order { get; set; }

        public List<CreateFullCourseLessonItemRequest> Items { get; set; } = new();
    }

    /// <summary>
    /// Lesson item data within the full course creation request.
    /// </summary>
    public record CreateFullCourseLessonItemRequest : IValidatableObject
    {
        /// <summary>
        /// Existing lesson item ID if using a pre-created lesson item.
        /// If provided, Name and other fields are optional.
        /// </summary>
        public Guid? LessonItemId { get; set; }

        [StringLength(200, MinimumLength = 2, ErrorMessage = "Lesson item name must be between 2 and 200 characters.")]
        public string? Name { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Range(0, 3, ErrorMessage = "Type must be 0 (Video), 1 (RichContent), 2 (Quiz), or 3 (Resource).")]
        public int Type { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Order must be a non-negative number.")]
        public int Order { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Duration must be a non-negative number.")]
        public double DurationInSeconds { get; set; }

        /// <summary>
        /// Existing content ID if using pre-created content.
        /// If null, content must be provided in the Content property.
        /// </summary>
        public Guid? ContentId { get; set; }

        /// <summary>
        /// Content data for creating new content inline.
        /// Required if ContentId is not provided.
        /// </summary>
        public CreateFullCourseContentRequest? Content { get; set; }

        /// <summary>
        /// List of skill IDs associated with this lesson item.
        /// </summary>
        public List<Guid> SkillIds { get; set; } = new();

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Only require Name when creating a new lesson item (no LessonItemId)
            if (!LessonItemId.HasValue && string.IsNullOrWhiteSpace(Name))
            {
                yield return new ValidationResult(
                    "Lesson item name is required when creating a new lesson item.",
                    new[] { nameof(Name) });
            }

            // Only require content info when creating a new lesson item
            if (!LessonItemId.HasValue && !ContentId.HasValue && Content == null)
            {
                yield return new ValidationResult(
                    "Either ContentId or Content must be provided for new lesson items.",
                    new[] { nameof(ContentId), nameof(Content) });
            }
        }
    }

    /// <summary>
    /// Content data for inline content creation within the full course request.
    /// </summary>
    public record CreateFullCourseContentRequest
    {
        /// <summary>
        /// Video content data. Required when Type is 0 (Video).
        /// </summary>
        public CreateFullCourseVideoContent? Video { get; set; }

        /// <summary>
        /// Rich text content data. Required when Type is 1 (RichContent).
        /// </summary>
        public CreateFullCourseRichTextContent? RichText { get; set; }

        /// <summary>
        /// Quiz content data. Required when Type is 2 (Quiz).
        /// </summary>
        public CreateFullCourseQuizContent? Quiz { get; set; }

        /// <summary>
        /// Downloadable resource content data. Required when Type is 3 (Resource).
        /// </summary>
        public CreateFullCourseResourceContent? Resource { get; set; }
    }

    public record CreateFullCourseVideoContent
    {
        [Required(ErrorMessage = "Video title is required.")]
        [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
        public string Title { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [StringLength(2048, ErrorMessage = "Thumbnail URL must not exceed 2048 characters.")]
        public string? ThumbnailUrl { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Duration must be a non-negative number.")]
        public double DurationInSeconds { get; set; }

        /// <summary>
        /// Mux video asset ID for uploaded videos.
        /// </summary>
        public Guid? VideoAssetId { get; set; }

        /// <summary>
        /// Mux playback ID for the video.
        /// </summary>
        public string? PlaybackId { get; set; }

        public string Provider { get; set; } = "Mux";
    }

    public record CreateFullCourseRichTextContent
    {
        [Required(ErrorMessage = "Rich text title is required.")]
        [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "HTML content is required.")]
        public string HtmlContent { get; set; } = null!;
    }

    public record CreateFullCourseQuizContent
    {
        [Required(ErrorMessage = "Quiz title is required.")]
        [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
        public string Title { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "At least one question is required.")]
        [MinLength(1, ErrorMessage = "At least one question must be provided.")]
        public List<CreateFullCourseQuizQuestion> Questions { get; set; } = new();
    }

    public record CreateFullCourseQuizQuestion
    {
        [Required(ErrorMessage = "Question text is required.")]
        [StringLength(1000, ErrorMessage = "Question text must not exceed 1000 characters.")]
        public string QuestionText { get; set; } = null!;

        [Required(ErrorMessage = "Options are required.")]
        [MinLength(2, ErrorMessage = "At least 2 options must be provided.")]
        public List<string> Options { get; set; } = new();

        [Required(ErrorMessage = "Correct answer index is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Correct answer index must be a non-negative number.")]
        public int CorrectAnswerIndex { get; set; }
    }

    /// <summary>
    /// Downloadable resource content data for the full course creation request.
    /// </summary>
    public record CreateFullCourseResourceContent
    {
        [Required(ErrorMessage = "Resource title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Resource title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "File URL is required.")]
        [StringLength(2048, ErrorMessage = "File URL must not exceed 2048 characters.")]
        public string FileUrl { get; set; } = null!;

        [Required(ErrorMessage = "File name is required.")]
        [StringLength(500, ErrorMessage = "File name must not exceed 500 characters.")]
        public string FileName { get; set; } = null!;

        public long FileSize { get; set; }

        [StringLength(200, ErrorMessage = "Content type must not exceed 200 characters.")]
        public string? ContentType { get; set; }
    }
}
