namespace TAIF.Application.Options;

public class FileUploadOptions
{
    public const string SectionName = "FileUpload";

    public long ResourceMaxSizeBytes { get; set; } = 50 * 1024 * 1024;

    public string[] AllowedResourceExtensions { get; set; } =
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".txt", ".csv", ".zip", ".rar", ".7z",
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"
    };
}
