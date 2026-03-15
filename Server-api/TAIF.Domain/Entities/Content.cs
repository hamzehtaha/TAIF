using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mime;
using System.Text.Json;
using TAIF.Domain.Interfaces;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Domain.Entities
{
    public class Content : OrganizationBase
    {
        // JSON options for consistent camelCase serialization and case-insensitive deserialization
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        public LessonItemType Type { get; private set; }
        public string ContentJson { get; private set; }

        private Content() { }

        public Content(LessonItemType type, IContentData data)
        {
            Type = type;
            SetContentData(data);
        }

        [NotMapped]
        public IContentData ContentData
        {
            get => DeserializeContent();
            set => SetContentData(value);
        }

        private void SetContentData(IContentData data)
        {
            ContentJson = JsonSerializer.Serialize(data, data.GetType(), JsonOptions);
        }

        private IContentData DeserializeContent()
        {
            return Type switch
            {
                LessonItemType.Video => JsonSerializer.Deserialize<Video>(ContentJson, JsonOptions)!,
                LessonItemType.RichText => JsonSerializer.Deserialize<RichText>(ContentJson, JsonOptions)!,
                LessonItemType.Quiz => JsonSerializer.Deserialize<Quiz>(ContentJson, JsonOptions)!,
                _ => throw new NotSupportedException("Unsupported content type")
            };
        }
    }
}
