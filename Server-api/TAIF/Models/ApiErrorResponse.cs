namespace TAIF.API.Models
{
    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public int StatusCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    }
}
