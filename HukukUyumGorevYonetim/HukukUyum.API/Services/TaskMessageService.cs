using HukukUyum.API.Data;
using HukukUyum.API.DTOs.TaskMessages;
using HukukUyum.API.Entities;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class TaskMessageService : ITaskMessageService
{
    private readonly ApplicationDbContext _context;
    private readonly IManagerDelegationService _delegations;

    public TaskMessageService(
        ApplicationDbContext context, IManagerDelegationService delegations)
    {
        _context = context;
        _delegations = delegations;
    }

    private async Task<bool> HasAccessAsync(
        int taskId,
        string currentUserId,
        bool isAdmin)
    {
        var task = await _context.Tasks
            .AsNoTracking()
            .Where(task => task.Id == taskId && !task.IsDeleted)
            .Select(task => new
            {
                task.IsUserRequest,
                task.CreatedByUserId,
                task.AssignedGroupId,
                task.AssignedUserId
            })
            .FirstOrDefaultAsync();

        if (task is null) return false;
        if (isAdmin) return true;
        if (!task.AssignedGroupId.HasValue)
        {
            return false;
        }

        var managedGroups = await _delegations.GetAccessibleGroupIdsAsync(currentUserId);
        if (managedGroups.Contains(task.AssignedGroupId.Value)) return true;

        if (task.IsUserRequest)
        {
            // Talep sahibi, mevcut sorumlu ve grup yöneticisi ortak sohbeti paylaşır.
            if (task.CreatedByUserId == currentUserId ||
                task.AssignedUserId == currentUserId)
            {
                return true;
            }

            return await _context.Groups
                .AsNoTracking()
                .AnyAsync(group =>
                    group.Id == task.AssignedGroupId.Value &&
                    group.ManagerUserId == currentUserId);
        }

        // Normal görevlerde mevcut grup sohbeti yetkilendirmesi korunur.
        return await _context.UserGroups
            .AsNoTracking()
            .AnyAsync(userGroup =>
                userGroup.GroupId == task.AssignedGroupId.Value &&
                userGroup.UserId == currentUserId);
    }

    public async Task<int> GetUnreadCountAsync(int taskId, string userId, bool isAdmin)
    {
        if (!await HasAccessAsync(taskId, userId, isAdmin)) throw new UnauthorizedAccessException();
        return await _context.Notifications.AsNoTracking().CountAsync(n =>
            n.UserId == userId && n.TaskItemId == taskId && n.Title == "Yeni sohbet mesajı" && !n.IsRead);
    }

    public async Task MarkReadAsync(int taskId, int throughMessageId, string userId, bool isAdmin)
    {
        if (!await HasAccessAsync(taskId, userId, isAdmin)) throw new UnauthorizedAccessException();
        var through = await _context.TaskMessages.AsNoTracking()
            .Where(m => m.TaskItemId == taskId && m.Id == throughMessageId)
            .Select(m => (DateTime?)m.CreatedAt).FirstOrDefaultAsync();
        if (!through.HasValue) return;
        await _context.Notifications.Where(n => n.UserId == userId && n.TaskItemId == taskId &&
            n.Title == "Yeni sohbet mesajı" && !n.IsRead && n.CreatedAt <= through.Value)
            .ExecuteUpdateAsync(set => set.SetProperty(n => n.IsRead, true));
    }

    public async Task<List<TaskMessageResponseDto>>
        GetMessagesAsync(
            int taskId,
            string currentUserId,
            bool isAdmin)
    {
        var hasAccess =
            await HasAccessAsync(
                taskId,
                currentUserId,
                isAdmin);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException();
        }

        var query =
            _context.TaskMessages
                .AsNoTracking()
                .Where(message =>
                    message.TaskItemId ==
                        taskId);

        return await query
            .OrderBy(message =>
                message.CreatedAt)
            .Select(message =>
                new TaskMessageResponseDto
                {
                    Id = message.Id,
                    UserId = message.UserId,
                    FullName =
                        message.User.FullName,
                    Message =
                        message.Message,
                    CreatedAt =
                        message.CreatedAt
                })
            .ToListAsync();
    }

    public async Task<TaskMessageResponseDto>
        CreateMessageAsync(
            int taskId,
            CreateTaskMessageDto dto,
            string currentUserId,
            bool isAdmin)
    {
        var hasAccess =
            await HasAccessAsync(
                taskId,
                currentUserId,
                isAdmin);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException();
        }

        var trimmedMessage =
            dto.Message.Trim();

        if (string.IsNullOrWhiteSpace(
                trimmedMessage))
        {
            throw new InvalidOperationException(
                "Mesaj boş olamaz.");
        }

        var taskExists =
            await _context.Tasks
                .AsNoTracking()
                .AnyAsync(task =>
                    task.Id == taskId &&
                    !task.IsDeleted);

        if (!taskExists)
        {
            throw new InvalidOperationException(
                "Görev veya talep bulunamadı.");
        }

        var message =
            new TaskMessage
            {
                TaskItemId = taskId,
                UserId = currentUserId,
                Message = trimmedMessage,
                CreatedAt = DateTime.UtcNow
            };

        _context.TaskMessages.Add(
            message);

        var task = await _context.Tasks.AsNoTracking().FirstAsync(t => t.Id == taskId && !t.IsDeleted);
        var recipients = new HashSet<string>();
        if (task.IsUserRequest)
        {
            if (!string.IsNullOrWhiteSpace(task.CreatedByUserId)) recipients.Add(task.CreatedByUserId);
            if (!string.IsNullOrWhiteSpace(task.AssignedUserId)) recipients.Add(task.AssignedUserId);
        }
        else if (task.AssignedGroupId.HasValue)
        {
            recipients.UnionWith(await _context.UserGroups.AsNoTracking()
                .Where(m => m.GroupId == task.AssignedGroupId).Select(m => m.UserId).ToListAsync());
        }
        if (task.AssignedGroupId.HasValue)
        {
            var manager = await _context.Groups.AsNoTracking().Where(g => g.Id == task.AssignedGroupId)
                .Select(g => g.ManagerUserId).FirstOrDefaultAsync();
            if (!string.IsNullOrWhiteSpace(manager)) recipients.Add(manager);
            var today = DateTime.UtcNow.Date;
            recipients.UnionWith(await _context.GroupManagerDelegations.AsNoTracking()
                .Where(d => d.GroupId == task.AssignedGroupId && d.IsActive &&
                    d.StartDate <= today && d.EndDate >= today)
                .Select(d => d.DelegateUserId).ToListAsync());
        }
        recipients.Remove(currentUserId);
        foreach (var recipient in recipients)
            _context.Notifications.Add(new Notification
            {
                UserId = recipient, TaskItemId = taskId, Title = "Yeni sohbet mesajı",
                // Bildirim önizlemesine özel mesaj içeriği taşınmaz.
                Message = $"#{taskId} numaralı kaydın sohbetinde yeni bir mesaj var.",
                CreatedAt = message.CreatedAt
            });
        await _context.SaveChangesAsync();

        var user =
            await _context.Users
                .AsNoTracking()
                .FirstAsync(user =>
                    user.Id ==
                        currentUserId);

        return new TaskMessageResponseDto
        {
            Id = message.Id,
            UserId = message.UserId,
            FullName = user.FullName,
            Message = message.Message,
            CreatedAt = message.CreatedAt
        };
    }
}
