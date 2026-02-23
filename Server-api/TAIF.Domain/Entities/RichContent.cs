namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Rich content entity for RichText type lesson items
    /// </summary>
    public class RichContent : OrganizationBase
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string Content { get; set; } = null!;
        public string ContentType { get; set; } = "html";
        public Guid? LessonItemId { get; set; }
        public LessonItem? LessonItem { get; set; }
    }
}
