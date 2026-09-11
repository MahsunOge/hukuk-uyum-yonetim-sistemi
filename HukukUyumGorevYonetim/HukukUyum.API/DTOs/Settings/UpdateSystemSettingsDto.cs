namespace HukukUyum.API.DTOs.Settings;

public class UpdateSystemSettingsDto
{
    public int MaximumFileSizeMb { get; set; }

    public bool AllowPdf { get; set; }

    public bool AllowWord { get; set; }

    public bool AllowExcel { get; set; }

    public string SmtpHost { get; set; } =
        string.Empty;

    public int SmtpPort { get; set; }

    public string SenderName { get; set; } =
        string.Empty;

    public string SenderEmail { get; set; } =
        string.Empty;
}