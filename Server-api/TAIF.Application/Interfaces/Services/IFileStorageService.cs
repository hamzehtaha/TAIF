namespace TAIF.Application.Interfaces.Services
{
    /// <summary>
    /// Abstraction for file storage operations.
    /// Implementations can be local file system, AWS S3, Azure Blob, etc.
    /// </summary>
    public interface IFileStorageService
    {
        /// <summary>
        /// Uploads a file and returns the public URL.
        /// </summary>
        /// <param name="fileStream">The file stream to upload</param>
        /// <param name="fileName">Original file name</param>
        /// <param name="contentType">MIME content type</param>
        /// <param name="folder">Optional folder/category (e.g., "courses", "lessons")</param>
        /// <returns>Public URL to access the uploaded file</returns>
        Task<FileUploadResult> UploadAsync(Stream fileStream, string fileName, string contentType, string? folder = null);

        /// <summary>
        /// Deletes a file by its URL or path.
        /// </summary>
        /// <param name="fileUrl">The URL or path of the file to delete</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteAsync(string fileUrl);

        /// <summary>
        /// Checks if a file exists.
        /// </summary>
        /// <param name="fileUrl">The URL or path of the file</param>
        /// <returns>True if the file exists</returns>
        Task<bool> ExistsAsync(string fileUrl);

        /// <summary>
        /// Gets the storage provider name (e.g., "Local", "S3", "Azure")
        /// </summary>
        string ProviderName { get; }
    }

    /// <summary>
    /// Result of a file upload operation.
    /// </summary>
    public class FileUploadResult
    {
        /// <summary>
        /// Public URL to access the file.
        /// </summary>
        public string Url { get; set; } = null!;

        /// <summary>
        /// Unique file identifier/key in the storage.
        /// </summary>
        public string FileKey { get; set; } = null!;

        /// <summary>
        /// Original file name.
        /// </summary>
        public string FileName { get; set; } = null!;

        /// <summary>
        /// File size in bytes.
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Content type of the file.
        /// </summary>
        public string ContentType { get; set; } = null!;
    }
}
