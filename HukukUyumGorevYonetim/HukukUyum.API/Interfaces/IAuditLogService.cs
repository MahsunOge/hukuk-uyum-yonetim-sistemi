using HukukUyum.API.DTOs.AuditLogs;

namespace HukukUyum.API.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        string? userId,
        string action,
        string entityType,
        string? entityId,
        string description);

    Task<List<AuditLogResponseDto>> GetAllAsync(int limit = 300);

    Task<List<AuditLogResponseDto>>
        GetTaskAssignmentHistoryAsync(
            int taskId,
            int limit = 50);
}
