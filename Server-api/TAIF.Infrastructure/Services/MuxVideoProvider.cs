using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TAIF.Application.DTOs.VideoDtos;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Infrastructure.Services
{
    public class MuxVideoProvider : IVideoProvider
    {
        private readonly HttpClient _httpClient;
        private readonly MuxOptions _options;
        private readonly ILogger<MuxVideoProvider> _logger;
        private const string MuxApiBaseUrl = "https://api.mux.com";

        public MuxVideoProvider(
            HttpClient httpClient,
            IOptions<MuxOptions> options,
            ILogger<MuxVideoProvider> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;

            var credentials = Convert.ToBase64String(
                Encoding.ASCII.GetBytes($"{_options.TokenId}:{_options.TokenSecret}"));
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", credentials);
        }

        public async Task<ProviderUploadResult> CreateDirectUploadAsync(string? correlationId = null)
        {
            // Use signed playback policy for security - requires JWT token for playback
            var requestBody = new
            {
                cors_origin = "*",
                new_asset_settings = new
                {
                    playback_policy = new[] { "signed" },
                    passthrough = correlationId,
                    // Enable MP4 support for download protection analysis
                    mp4_support = "none",
                    // Normalize audio for consistent playback
                    normalize_audio = true,
                    // Enable per-title encoding for optimal quality/bitrate
                    encoding_tier = "smart"
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{MuxApiBaseUrl}/video/v1/uploads", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Mux API error creating upload: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                throw new Exception($"Failed to create Mux upload: {responseContent}");
            }

            var muxResponse = JsonSerializer.Deserialize<MuxUploadResponse>(responseContent);

            return new ProviderUploadResult
            {
                UploadUrl = muxResponse!.Data.Url,
                UploadId = muxResponse.Data.Id
            };
        }

        public async Task<ProviderUploadInfo?> GetUploadInfoAsync(string uploadId)
        {
            var response = await _httpClient.GetAsync($"{MuxApiBaseUrl}/video/v1/uploads/{uploadId}");
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Mux API error getting upload: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return null;
            }

            var muxResponse = JsonSerializer.Deserialize<MuxUploadResponse>(responseContent);
            var upload = muxResponse?.Data;

            if (upload == null) return null;

            return new ProviderUploadInfo
            {
                UploadId = upload.Id,
                AssetId = upload.AssetId,
                Status = upload.Status ?? "unknown"
            };
        }

        public async Task<ProviderAssetInfo?> GetAssetInfoAsync(string assetId)
        {
            var response = await _httpClient.GetAsync($"{MuxApiBaseUrl}/video/v1/assets/{assetId}");
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Mux API error getting asset: {StatusCode} - {Response}",
                    response.StatusCode, responseContent);
                return null;
            }

            var muxResponse = JsonSerializer.Deserialize<MuxAssetResponse>(responseContent);
            var asset = muxResponse?.Data;

            if (asset == null) return null;

            var playbackId = asset.PlaybackIds?.FirstOrDefault()?.Id;

            return new ProviderAssetInfo
            {
                AssetId = asset.Id,
                PlaybackId = playbackId,
                DurationInSeconds = asset.Duration ?? 0,
                ThumbnailUrl = playbackId != null ? GenerateThumbnailUrl(playbackId) : null,
                IsReady = asset.Status == "ready",
                ErrorMessage = asset.Errors?.FirstOrDefault()?.Message
            };
        }

        public string GeneratePlaybackUrl(string playbackId)
        {
            return $"https://stream.mux.com/{playbackId}.m3u8";
        }

        /// <summary>
        /// Generates a signed JWT token for Mux video playback with security features.
        /// </summary>
        /// <param name="playbackId">The Mux playback ID</param>
        /// <param name="userId">User ID for watermarking and audit</param>
        /// <param name="userEmail">User email for watermark display</param>
        /// <returns>Signed JWT token for playback</returns>
        public string GenerateSignedPlaybackToken(string playbackId, string? userId = null, string? userEmail = null)
        {
            if (string.IsNullOrEmpty(_options.SigningKeyId) || string.IsNullOrEmpty(_options.SigningKeySecret))
            {
                _logger.LogWarning("Mux signing keys not configured. Returning empty token.");
                return string.Empty;
            }

            try
            {
                // Decode the base64-encoded private key
                var privateKeyBytes = Convert.FromBase64String(_options.SigningKeySecret);
                var privateKeyPem = Encoding.UTF8.GetString(privateKeyBytes);
                
                // Create RSA key from PEM
                var rsa = RSA.Create();
                rsa.ImportFromPem(privateKeyPem);
                var securityKey = new RsaSecurityKey(rsa);

                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

                var now = DateTime.UtcNow;
                var expiry = now.AddSeconds(_options.TokenValiditySeconds);

                var claims = new List<Claim>
                {
                    new Claim("sub", playbackId),
                    new Claim("kid", _options.SigningKeyId),
                    new Claim("aud", "v"),  // "v" for video playback
                };

                // Add user info for tracking/watermark if provided
                if (!string.IsNullOrEmpty(userId))
                {
                    claims.Add(new Claim("viewer_id", userId));
                }

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = expiry,
                    IssuedAt = now,
                    SigningCredentials = signingCredentials
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                _logger.LogDebug("Generated signed playback token for {PlaybackId}, expires at {Expiry}", 
                    playbackId, expiry);

                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate signed playback token for {PlaybackId}", playbackId);
                throw new InvalidOperationException("Failed to generate video playback token", ex);
            }
        }

        /// <summary>
        /// Generates a signed token for thumbnail access
        /// </summary>
        public string GenerateSignedThumbnailToken(string playbackId)
        {
            if (string.IsNullOrEmpty(_options.SigningKeyId) || string.IsNullOrEmpty(_options.SigningKeySecret))
            {
                return string.Empty;
            }

            try
            {
                var privateKeyBytes = Convert.FromBase64String(_options.SigningKeySecret);
                var privateKeyPem = Encoding.UTF8.GetString(privateKeyBytes);
                
                var rsa = RSA.Create();
                rsa.ImportFromPem(privateKeyPem);
                var securityKey = new RsaSecurityKey(rsa);

                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

                var now = DateTime.UtcNow;
                var expiry = now.AddSeconds(_options.TokenValiditySeconds);

                var claims = new List<Claim>
                {
                    new Claim("sub", playbackId),
                    new Claim("kid", _options.SigningKeyId),
                    new Claim("aud", "t"),  // "t" for thumbnail
                };

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = expiry,
                    IssuedAt = now,
                    SigningCredentials = signingCredentials
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate signed thumbnail token for {PlaybackId}", playbackId);
                return string.Empty;
            }
        }

        public string GenerateThumbnailUrl(string playbackId, int? width = null, int? height = null, double? time = null)
        {
            var url = $"https://image.mux.com/{playbackId}/thumbnail.jpg";
            var queryParams = new List<string>();

            if (width.HasValue) queryParams.Add($"width={width}");
            if (height.HasValue) queryParams.Add($"height={height}");
            if (time.HasValue) queryParams.Add($"time={time}");

            if (queryParams.Count > 0)
            {
                url += "?" + string.Join("&", queryParams);
            }

            return url;
        }

        public bool ValidateWebhookSignature(string payload, string signature, string webhookSecret)
        {
            if (string.IsNullOrEmpty(signature) || string.IsNullOrEmpty(webhookSecret))
                return false;

            try
            {
                var parts = signature.Split(',')
                    .Select(p => p.Split('='))
                    .Where(p => p.Length == 2)
                    .ToDictionary(p => p[0], p => p[1]);

                if (!parts.TryGetValue("t", out var timestamp) ||
                    !parts.TryGetValue("v1", out var expectedSignature))
                {
                    return false;
                }

                var signedPayload = $"{timestamp}.{payload}";
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(webhookSecret));
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signedPayload));
                var computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

                return computedSignature == expectedSignature;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Mux webhook signature");
                return false;
            }
        }

        public Task<ProviderAssetInfo?> ParseWebhookEventAsync(string payload)
        {
            try
            {
                var webhookEvent = JsonSerializer.Deserialize<MuxWebhookEvent>(payload);

                if (webhookEvent == null)
                    return Task.FromResult<ProviderAssetInfo?>(null);

                _logger.LogInformation("Received Mux webhook event: {Type}", webhookEvent.Type);

                if (webhookEvent.Type == "video.asset.ready")
                {
                    var asset = webhookEvent.Data;
                    var playbackId = asset?.PlaybackIds?.FirstOrDefault()?.Id;

                    var result = new ProviderAssetInfo
                    {
                        AssetId = asset?.Id ?? string.Empty,
                        PlaybackId = playbackId,
                        DurationInSeconds = asset?.Duration ?? 0,
                        ThumbnailUrl = playbackId != null ? GenerateThumbnailUrl(playbackId) : null,
                        IsReady = true
                    };

                    return Task.FromResult<ProviderAssetInfo?>(result);
                }

                if (webhookEvent.Type == "video.asset.errored")
                {
                    var asset = webhookEvent.Data;
                    var result = new ProviderAssetInfo
                    {
                        AssetId = asset?.Id ?? string.Empty,
                        IsReady = false,
                        ErrorMessage = asset?.Errors?.FirstOrDefault()?.Message ?? "Unknown error"
                    };

                    return Task.FromResult<ProviderAssetInfo?>(result);
                }

                if (webhookEvent.Type == "video.upload.asset_created")
                {
                    var uploadId = webhookEvent.Data?.Id;
                    var assetId = webhookEvent.Data?.AssetId;

                    if (!string.IsNullOrEmpty(assetId))
                    {
                        var result = new ProviderAssetInfo
                        {
                            AssetId = assetId,
                            IsReady = false
                        };
                        return Task.FromResult<ProviderAssetInfo?>(result);
                    }
                }

                return Task.FromResult<ProviderAssetInfo?>(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing Mux webhook payload");
                return Task.FromResult<ProviderAssetInfo?>(null);
            }
        }
    }

    #region Mux API Response Models

    internal class MuxUploadResponse
    {
        [JsonPropertyName("data")]
        public MuxUploadData Data { get; set; } = null!;
    }

    internal class MuxUploadData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("url")]
        public string Url { get; set; } = null!;

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("asset_id")]
        public string? AssetId { get; set; }
    }

    internal class MuxAssetResponse
    {
        [JsonPropertyName("data")]
        public MuxAssetData? Data { get; set; }
    }

    internal class MuxAssetData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("duration")]
        public double? Duration { get; set; }

        [JsonPropertyName("playback_ids")]
        public List<MuxPlaybackId>? PlaybackIds { get; set; }

        [JsonPropertyName("errors")]
        public List<MuxError>? Errors { get; set; }

        [JsonPropertyName("passthrough")]
        public string? Passthrough { get; set; }

        [JsonPropertyName("asset_id")]
        public string? AssetId { get; set; }
    }

    internal class MuxPlaybackId
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("policy")]
        public string? Policy { get; set; }
    }

    internal class MuxError
    {
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }

    internal class MuxWebhookEvent
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = null!;

        [JsonPropertyName("data")]
        public MuxAssetData? Data { get; set; }

        [JsonPropertyName("object")]
        public MuxWebhookObject? Object { get; set; }
    }

    internal class MuxWebhookObject
    {
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    #endregion
}
