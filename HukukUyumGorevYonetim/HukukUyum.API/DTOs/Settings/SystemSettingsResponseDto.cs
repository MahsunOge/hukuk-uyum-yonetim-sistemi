namespace HukukUyum.API.DTOs.Settings;

public class SystemSettingsResponseDto
{
    public string EnvironmentName { get; set; } =
        string.Empty;

    public string EmailHost { get; set; } =
        string.Empty;

    public int EmailPort { get; set; }

    public string SenderEmail { get; set; } =
        string.Empty;

    public string SenderName { get; set; } =
        string.Empty;

    public bool EmailConfigured { get; set; }

    public int MaximumFileSizeMb { get; set; }

    public List<string> AllowedFileExtensions { get; set; } =
        [];
}