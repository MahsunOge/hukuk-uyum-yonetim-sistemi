using HukukUyum.API.Data;
using HukukUyum.API.DTOs.AuditLogs;
using HukukUyum.API.Entities;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;

    public AuditLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
        string? userId,
        string action,
        string entityType,
        string? entityId,
        string description)
    {
        if (string.IsNullOrWhiteSpace(action))
            throw new ArgumentException("Audit işlemi boş olamaz.", nameof(action));

        if (string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("Audit entity türü boş olamaz.", nameof(entityType));

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Audit açıklaması boş olamaz.", nameof(description));

        var auditLog = new AuditLog
        {
            UserId = string.IsNullOrWhiteSpace(userId) ? null : userId,
            Action = action.Trim(),
            EntityType = entityType.Trim(),
            EntityId = string.IsNullOrWhiteSpace(entityId) ? null : entityId.Trim(),
            Description = description.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AuditLogResponseDto>> GetAllAsync(int limit = 300)
    {
        return await BuildResponseAsync(
            _context.AuditLogs.AsNoTracking()
                .OrderByDescending(log => log.CreatedAt),
            limit);
    }

    public async Task<List<AuditLogResponseDto>>
        GetTaskAssignmentHistoryAsync(int taskId, int limit = 50)
    {
        var entityId = taskId.ToString();

        var query =
            _context.AuditLogs
                .AsNoTracking()
                .Where(log =>
                    log.EntityType == "Task" &&
                    log.EntityId == entityId &&
                    (
                        log.Action == "TASK_ASSIGNED" ||
                        log.Action == "TASK_CREATED"
                    ))
                .OrderByDescending(log => log.CreatedAt);

        return await BuildResponseAsync(query, limit);
    }

    private async Task<List<AuditLogResponseDto>>
        BuildResponseAsync(IQueryable<AuditLog> query, int limit)
    {
        limit = Math.Clamp(limit, 1, 1000);

        var auditLogs = await query.Take(limit).ToListAsync();

        var userIds =
            auditLogs
                .Where(log => !string.IsNullOrWhiteSpace(log.UserId))
                .Select(log => log.UserId!)
                .Distinct()
                .ToList();

        var userNames =
            await _context.Users
                .AsNoTracking()
                .Where(user => userIds.Contains(user.Id))
                .Select(user => new { user.Id, user.FullName })
                .ToDictionaryAsync(user => user.Id, user => user.FullName);

        return auditLogs.Select(log =>
            new AuditLogResponseDto
            {
                Id = log.Id,
                UserId = log.UserId,
                UserFullName =
                    log.UserId is not null &&
                    userNames.TryGetValue(log.UserId, out var fullName)
                        ? fullName
                        : "Sistem",
                Action = log.Action,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                Description = log.Description,
                CreatedAt = log.CreatedAt
            }).ToList();
    }
}
