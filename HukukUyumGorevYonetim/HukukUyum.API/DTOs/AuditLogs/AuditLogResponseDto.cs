namespace HukukUyum.API.DTOs.AuditLogs;

public class AuditLogResponseDto
{
    public int Id { get; set; }

    public string? UserId { get; set; }

    public string UserFullName { get; set; } =
        string.Empty;

    public string Action { get; set; } =
        string.Empty;

    public string EntityType { get; set; } =
        string.Empty;

    public string? EntityId { get; set; }

    public string Description { get; set; } =
        string.Empty;

    public DateTime CreatedAt { get; set; }
}
