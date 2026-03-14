using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.VideoDtos;
using TAIF.Application.Interfaces.Services;

namespace TAIF.API.Controllers
{
    [Route("api/videos")]
    [ApiController]
    [Authorize]
    public class VideoController : TaifControllerBase
    {
        private readonly IVideoAssetService _videoAssetService;
        private readonly ILogger<VideoController> _logger;

        public VideoController(
            IVideoAssetService videoAssetService,
            ILogger<VideoController> logger)
        {
            _videoAssetService = videoAssetService;
            _logger = logger;
        }

        [HttpPost("create-upload")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<VideoUploadResponseDto>> CreateUpload([FromBody] VideoUploadRequestDto request)
        {
            if (OrganizationId == null)
            {
                return BadRequest("Organization context is required");
            }

            var result = await _videoAssetService.CreateUploadAsync(request, OrganizationId.Value);
            return Ok(result);
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook()
        {
            var signature = Request.Headers["Mux-Signature"].FirstOrDefault() ?? string.Empty;

            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync();

            _logger.LogDebug("Received Mux webhook. Signature: {Signature}", signature);

            try
            {
                await _videoAssetService.HandleWebhookAsync(payload, signature);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Webhook signature validation failed");
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return StatusCode(500, "Error processing webhook");
            }
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<VideoPlaybackDto>> GetVideo(Guid id)
        {
            var playbackInfo = await _videoAssetService.GetPlaybackInfoAsync(id);

            if (playbackInfo == null)
            {
                return NotFound();
            }

            return Ok(playbackInfo);
        }

        [HttpGet("{id:guid}/status")]
        [Authorize]
        public async Task<ActionResult<object>> GetVideoStatus(Guid id)
        {
            var videoAsset = await _videoAssetService.GetByIdAsync(id);

            if (videoAsset == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                videoAsset.Id,
                videoAsset.Status,
                videoAsset.ErrorMessage,
                IsReady = videoAsset.Status == Domain.Entities.VideoAssetStatus.Ready
            });
        }

        /// <summary>
        /// Generates a signed playback token for secure video access.
        /// Token is valid for 1 hour and includes user tracking for watermarking.
        /// </summary>
        /// <param name="id">Video asset ID</param>
        /// <returns>Signed playback token with expiry info</returns>
        [HttpGet("{id:guid}/token")]
        [Authorize]
        public async Task<ActionResult<SignedPlaybackTokenDto>> GetSignedPlaybackToken(Guid id)
        {
            var userId = this.UserId.ToString();
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var tokenDto = await _videoAssetService.GenerateSignedPlaybackTokenByAssetIdAsync(id, userId, userEmail);

            if (tokenDto == null)
            {
                return NotFound("Video not found or not ready for playback");
            }

            return Ok(tokenDto);
        }

        /// <summary>
        /// Generates a signed playback token using a playback ID directly.
        /// Token is valid for 1 hour and includes user tracking for watermarking.
        /// </summary>
        /// <param name="playbackId">Mux playback ID</param>
        /// <returns>Signed playback token with expiry info</returns>
        [HttpGet("playback/{playbackId}/token")]
        [Authorize]
        public ActionResult<SignedPlaybackTokenDto> GetSignedPlaybackTokenByPlaybackId(string playbackId)
        {
            if (string.IsNullOrEmpty(playbackId))
            {
                return BadRequest("Playback ID is required");
            }

            var userId = this.UserId.ToString();
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var tokenDto = _videoAssetService.GenerateSignedPlaybackToken(playbackId, userId, userEmail);

            if (string.IsNullOrEmpty(tokenDto.Token))
            {
                return StatusCode(503, "Signing keys not configured");
            }

            return Ok(tokenDto);
        }
    }
}
