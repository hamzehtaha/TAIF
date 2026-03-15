namespace TAIF.Application.DTOs.VideoDtos
{
    /// <summary>
    /// Response DTO containing signed playback token for secure video access
    /// </summary>
    public class SignedPlaybackTokenDto
    {
        /// <summary>
        /// The signed JWT token for video playback
        /// </summary>
        public string Token { get; set; } = null!;

        /// <summary>
        /// The playback ID this token is for
        /// </summary>
        public string PlaybackId { get; set; } = null!;

        /// <summary>
        /// Token expiration time in UTC
        /// </summary>
        public DateTime ExpiresAt { get; set; }

        /// <summary>
        /// Token validity duration in seconds
        /// </summary>
        public int ExpiresInSeconds { get; set; }

        /// <summary>
        /// Signed token for thumbnail access (optional)
        /// </summary>
        public string? ThumbnailToken { get; set; }
    }
}
