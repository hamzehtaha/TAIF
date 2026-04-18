using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;
using TAIF.Infrastructure.Services;

namespace TAIF.API.Controllers
{
    [Route("api/files")]
    [ApiController]
    [Authorize]
    public class FileUploadController : TaifControllerBase
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly LocalStorageOptions _storageOptions;
        private readonly FileUploadOptions _uploadOptions;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(
            IFileStorageService fileStorageService,
            IOptions<LocalStorageOptions> storageOptions,
            IOptions<FileUploadOptions> uploadOptions,
            ILogger<FileUploadController> logger)
        {
            _fileStorageService = fileStorageService;
            _storageOptions = storageOptions.Value;
            _uploadOptions = uploadOptions.Value;
            _logger = logger;
        }

        /// <summary>
        /// Upload an image file for courses, lessons, etc.
        /// </summary>
        /// <param name="file">The image file to upload</param>
        /// <param name="folder">Optional folder category (courses, lessons, lesson-items)</param>
        /// <returns>Upload result with URL</returns>
        [HttpPost("upload/image")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<FileUploadResult>> UploadImage(IFormFile file, [FromQuery] string? folder = null)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            // Sanitize folder parameter to prevent path traversal
            if (!string.IsNullOrEmpty(folder))
            {
                folder = Path.GetFileName(folder);
                if (string.IsNullOrWhiteSpace(folder) || folder.Contains(".."))
                    return BadRequest("Invalid folder name");
            }

            // Validate file size
            if (file.Length > _storageOptions.MaxFileSize)
            {
                return BadRequest($"File size exceeds maximum allowed size of {_storageOptions.MaxFileSize / (1024 * 1024)}MB");
            }

            // Validate file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_storageOptions.AllowedImageExtensions.Contains(extension))
            {
                return BadRequest($"File type not allowed. Allowed types: {string.Join(", ", _storageOptions.AllowedImageExtensions)}");
            }

            // Validate content type
            if (!file.ContentType.StartsWith("image/"))
            {
                return BadRequest("Only image files are allowed");
            }

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType, folder);
                
                _logger.LogInformation("User {UserId} uploaded image: {FileName} -> {Url}", 
                    UserId, file.FileName, result.Url);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file: {FileName}", file.FileName);
                return StatusCode(500, "Error uploading file");
            }
        }

        /// <summary>
        /// Upload a course thumbnail image.
        /// </summary>
        [HttpPost("upload/course-thumbnail")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<FileUploadResult>> UploadCourseThumbnail(IFormFile file)
        {
            return await UploadImage(file, "courses");
        }

        /// <summary>
        /// Upload a lesson thumbnail image.
        /// </summary>
        [HttpPost("upload/lesson-thumbnail")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<FileUploadResult>> UploadLessonThumbnail(IFormFile file)
        {
            return await UploadImage(file, "lessons");
        }

        /// <summary>
        /// Upload a lesson item image.
        /// </summary>
        [HttpPost("upload/lesson-item-image")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<FileUploadResult>> UploadLessonItemImage(IFormFile file)
        {
            return await UploadImage(file, "lesson-items");
        }

        /// <summary>
        /// Upload a downloadable resource file (PDF, documents, images, archives).
        /// Used by content creators to attach downloadable resources to lesson items.
        /// </summary>
        /// <param name="file">The resource file to upload</param>
        /// <returns>Upload result with URL, file name, file size, and content type</returns>
        [HttpPost("upload/resource")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult<FileUploadResult>> UploadResource(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            // Max resource size from configuration
            if (file.Length > _uploadOptions.ResourceMaxSizeBytes)
            {
                return BadRequest($"File size exceeds maximum allowed size of {_uploadOptions.ResourceMaxSizeBytes / (1024 * 1024)}MB");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new HashSet<string>(_uploadOptions.AllowedResourceExtensions);

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest($"File type not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType, "resources");

                _logger.LogInformation("User {UserId} uploaded resource: {FileName} -> {Url}",
                    UserId, file.FileName, result.Url);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading resource file: {FileName}", file.FileName);
                return StatusCode(500, "Error uploading file");
            }
        }

        /// <summary>
        /// Delete an uploaded file.
        /// </summary>
        [HttpDelete]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<ActionResult> DeleteFile([FromQuery] string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return BadRequest("File URL is required");
            }

            var deleted = await _fileStorageService.DeleteAsync(fileUrl);
            
            if (deleted)
            {
                _logger.LogInformation("User {UserId} deleted file: {FileUrl}", UserId, fileUrl);
                return Ok(new { message = "File deleted successfully" });
            }

            return NotFound("File not found");
        }
    }
}
