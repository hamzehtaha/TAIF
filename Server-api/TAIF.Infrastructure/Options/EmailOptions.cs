namespace TAIF.Infrastructure.Options;

public class EmailOptions
{
    public const string SectionName = "Email";

    public string Host { get; set; } = null!;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FromAddress { get; set; } = null!;
    public string FromName { get; set; } = "TAIF Platform";
    public bool EnableSsl { get; set; } = true;
}
