namespace TAIF.Application.DTOs.VideoDtos
{
    public class MuxOptions
    {
        public const string SectionName = "Mux";

        public string TokenId { get; set; } = null!;
        public string TokenSecret { get; set; } = null!;
        public string WebhookSecret { get; set; } = null!;
    }
}
