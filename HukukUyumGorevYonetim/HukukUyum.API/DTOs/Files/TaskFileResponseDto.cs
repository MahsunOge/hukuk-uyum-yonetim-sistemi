namespace HukukUyum.API.DTOs.Files;

public class TaskFileResponseDto
{
    public int Id { get; set; }

    public string OriginalFileName { get; set; } =
        string.Empty;

    public string ContentType { get; set; } =
        string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; }

    public int TaskItemId { get; set; }
}