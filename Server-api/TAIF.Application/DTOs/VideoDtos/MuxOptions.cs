namespace TAIF.Application.DTOs.VideoDtos
{
    public class MuxOptions
    {
        public const string SectionName = "Mux";

        /// <summary>
        /// Mux API Token ID for authentication
        /// </summary>
        public string TokenId { get; set; } = null!;
        
        /// <summary>
        /// Mux API Token Secret for authentication
        /// </summary>
        public string TokenSecret { get; set; } = null!;
        
        /// <summary>
        /// Mux Webhook signing secret for validating webhook requests
        /// </summary>
        public string WebhookSecret { get; set; } = null!;
        
        /// <summary>
        /// Mux Signing Key ID for generating signed playback tokens.
        /// Create at: https://dashboard.mux.com/settings/signing-keys
        /// </summary>
        public string SigningKeyId { get; set; } = null!;
        
        /// <summary>
        /// Mux Signing Key Private Key (Base64 encoded) for JWT signing.
        /// This is the RSA private key provided when creating a signing key.
        /// </summary>
        public string SigningKeySecret { get; set; } = null!;
        
        /// <summary>
        /// Token validity duration in seconds. Default: 3600 (1 hour)
        /// </summary>
        public int TokenValiditySeconds { get; set; } = 3600;
        
        /// <summary>
        /// Enable watermarking on videos. When enabled, user info will be overlaid.
        /// </summary>
        public bool EnableWatermark { get; set; } = true;
    }
}
