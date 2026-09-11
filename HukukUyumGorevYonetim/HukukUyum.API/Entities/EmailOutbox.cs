using HukukUyum.API.Enums;

namespace HukukUyum.API.Entities;

public class EmailOutbox
{
    public int Id { get; set; }

    public string ToEmail { get; set; } =
        string.Empty;

    public string Subject { get; set; } =
        string.Empty;

    public string Body { get; set; } =
        string.Empty;

    public EmailStatus Status { get; set; } =
        EmailStatus.Pending;

    public int RetryCount { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? LastAttemptAt { get; set; }

    public DateTime? SentAt { get; set; }
}