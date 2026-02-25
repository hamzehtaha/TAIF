using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class RichText : IContentData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;
        
        [JsonPropertyName("html")]
        public string Html { get; set; } = null!;
    }
}
