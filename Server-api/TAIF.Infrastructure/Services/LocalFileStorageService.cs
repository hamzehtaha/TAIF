using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Infrastructure.Services
{
    /// <summary>
    /// Local file system storage implementation.
    /// Stores files in wwwroot/uploads directory.
    /// TODO: Switch to AWS S3 or other cloud storage in production.
    /// </summary>
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly LocalStorageOptions _options;
        private readonly ILogger<LocalFileStorageService> _logger;

        public string ProviderName => "Local";

        public LocalFileStorageService(
            IOptions<LocalStorageOptions> options,
            ILogger<LocalFileStorageService> logger)
        {
            _options = options.Value;
            _logger = logger;

            // Ensure base upload directory exists
            if (!Directory.Exists(_options.BasePath))
            {
                Directory.CreateDirectory(_options.BasePath);
                _logger.LogInformation("Created upload directory: {Path}", _options.BasePath);
            }
        }

        public async Task<FileUploadResult> UploadAsync(Stream fileStream, string fileName, string contentType, string? folder = null)
        {
            // Generate unique file name to avoid conflicts
            var fileExtension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            
            // Build folder path
            var folderPath = string.IsNullOrEmpty(folder) 
                ? _options.BasePath 
                : Path.Combine(_options.BasePath, folder);

            // Ensure folder exists
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var filePath = Path.Combine(folderPath, uniqueFileName);

            // Save file
            await using var fileStreamOut = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamOut);

            // Build URL path
            var urlPath = string.IsNullOrEmpty(folder)
                ? $"{_options.BaseUrl}/{uniqueFileName}"
                : $"{_options.BaseUrl}/{folder}/{uniqueFileName}";

            _logger.LogInformation("Uploaded file: {FileName} -> {FilePath}", fileName, filePath);

            return new FileUploadResult
            {
                Url = urlPath,
                FileKey = uniqueFileName,
                FileName = fileName,
                FileSize = fileStreamOut.Length,
                ContentType = contentType
            };
        }

        public Task<bool> DeleteAsync(string fileUrl)
        {
            try
            {
                // Extract file path from URL
                var relativePath = fileUrl.Replace(_options.BaseUrl, "").TrimStart('/');
                var filePath = Path.Combine(_options.BasePath, relativePath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("Deleted file: {FilePath}", filePath);
                    return Task.FromResult(true);
                }

                _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FileUrl}", fileUrl);
                return Task.FromResult(false);
            }
        }

        public Task<bool> ExistsAsync(string fileUrl)
        {
            try
            {
                var relativePath = fileUrl.Replace(_options.BaseUrl, "").TrimStart('/');
                var filePath = Path.Combine(_options.BasePath, relativePath);
                return Task.FromResult(File.Exists(filePath));
            }
            catch
            {
                return Task.FromResult(false);
            }
        }
    }

    /// <summary>
    /// Configuration options for local file storage.
    /// </summary>
    public class LocalStorageOptions
    {
        public const string SectionName = "LocalStorage";

        /// <summary>
        /// Base file system path for uploads (e.g., "wwwroot/uploads")
        /// </summary>
        public string BasePath { get; set; } = "wwwroot/uploads";

        /// <summary>
        /// Base URL for accessing uploaded files (e.g., "/uploads")
        /// </summary>
        public string BaseUrl { get; set; } = "/uploads";

        /// <summary>
        /// Maximum file size in bytes (default: 10MB)
        /// </summary>
        public long MaxFileSize { get; set; } = 10 * 1024 * 1024;

        /// <summary>
        /// Allowed file extensions for images
        /// </summary>
        public string[] AllowedImageExtensions { get; set; } = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
    }
}
