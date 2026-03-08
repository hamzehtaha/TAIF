namespace TAIF.Application.DTOs.VideoDtos
{
    public class VideoUploadRequestDto
    {
        public Guid? LessonItemId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? OriginalFileName { get; set; }
    }
}
