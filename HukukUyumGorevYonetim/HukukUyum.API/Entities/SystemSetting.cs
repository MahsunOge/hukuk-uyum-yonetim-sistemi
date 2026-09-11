namespace HukukUyum.API.Entities;

public class SystemSetting
{
    public int Id { get; set; }

    public int MaximumFileSizeMb { get; set; } =
        10;

    public bool AllowPdf { get; set; } =
        true;

    public bool AllowWord { get; set; } =
        true;

    public bool AllowExcel { get; set; } =
        true;

    public string SmtpHost { get; set; } =
        string.Empty;

    public int SmtpPort { get; set; } =
        587;

    public string SenderName { get; set; } =
        "Hukuk Uyum";

    public string SenderEmail { get; set; } =
        string.Empty;

    public DateTime UpdatedAt { get; set; } =
        DateTime.UtcNow;
}