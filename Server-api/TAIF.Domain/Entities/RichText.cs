using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class RichText : IContentData
    {
        [JsonPropertyName("title")]
        [Required(ErrorMessage = "RichText title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "RichText title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("html")]
        [Required(ErrorMessage = "HTML content is required.")]
        public string Html { get; set; } = null!;
    }
}
