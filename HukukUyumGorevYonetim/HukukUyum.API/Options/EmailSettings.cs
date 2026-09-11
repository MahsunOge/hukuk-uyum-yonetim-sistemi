namespace HukukUyum.API.Options;

public class EmailSettings
{
    public string Host { get; set; } =
        string.Empty;

    public int Port { get; set; } = 587;

    public string SenderEmail { get; set; } =
        string.Empty;

    public string SenderName { get; set; } =
        "Hukuk Uyum";

    public string Username { get; set; } =
        string.Empty;

    public string Password { get; set; } =
        string.Empty;

    public bool UseSsl { get; set; } = true;
}