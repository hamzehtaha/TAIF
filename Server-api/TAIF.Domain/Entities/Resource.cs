using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Downloadable resource content data stored in Content.ContentJson.
    /// Allows instructors to attach files (PDF, images, documents) for students to download.
    /// </summary>
    public class Resource : IContentData
    {
        [JsonPropertyName("title")]
        [Required(ErrorMessage = "Resource title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Resource title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("description")]
        [StringLength(2000, ErrorMessage = "Resource description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [JsonPropertyName("fileUrl")]
        [Required(ErrorMessage = "File URL is required.")]
        [StringLength(2048, ErrorMessage = "File URL must not exceed 2048 characters.")]
        public string FileUrl { get; set; } = null!;

        [JsonPropertyName("fileName")]
        [Required(ErrorMessage = "File name is required.")]
        [StringLength(500, ErrorMessage = "File name must not exceed 500 characters.")]
        public string FileName { get; set; } = null!;

        [JsonPropertyName("fileSize")]
        public long FileSize { get; set; }

        [JsonPropertyName("contentType")]
        [StringLength(200, ErrorMessage = "Content type must not exceed 200 characters.")]
        public string? ContentType { get; set; }
    }
}
