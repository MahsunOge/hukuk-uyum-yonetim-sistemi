using System.Security.Claims;
using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Notifications;
using HukukUyum.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(
            ClaimTypes.NameIdentifier);
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationResponseDto>>>
        GetNotifications()
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized();
        }

        await EnsureDelegationExpiryNotificationAsync(
            currentUserId);

        var rows =
            await _context.Notifications
                .AsNoTracking()
                .Where(notification =>
                    notification.UserId ==
                        currentUserId)
                .OrderByDescending(notification =>
                    notification.CreatedAt)
                .Take(50)
                .ToListAsync();

        return Ok(
            rows.Select(notification =>
                new NotificationResponseDto
                {
                    Id = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt,
                    TaskItemId = notification.TaskItemId,
                    Category =
                        ResolveCategory(
                            notification.Title)
                })
                .ToList());
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult>
        GetUnreadCount()
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized();
        }

        await EnsureDelegationExpiryNotificationAsync(
            currentUserId);

        var count =
            await _context.Notifications
                .AsNoTracking()
                .CountAsync(notification =>
                    notification.UserId ==
                        currentUserId &&
                    !notification.IsRead);

        return Ok(new { count });
    }

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult>
        MarkAsRead(int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized();
        }

        var notification =
            await _context.Notifications
                .FirstOrDefaultAsync(
                    notification =>
                        notification.Id == id &&
                        notification.UserId ==
                            currentUserId);

        if (notification is null)
        {
            return NotFound(new
            {
                message =
                    "Bildirim bulunamadı."
            });
        }

        if (!notification.IsRead)
        {
            notification.IsRead =
                true;

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message =
                "Bildirim okundu olarak işaretlendi."
        });
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult>
        MarkAllAsRead()
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized();
        }

        var notifications =
            await _context.Notifications
                .Where(notification =>
                    notification.UserId ==
                        currentUserId &&
                    !notification.IsRead)
                .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Tüm bildirimler okundu olarak işaretlendi."
        });
    }

    private async Task
        EnsureDelegationExpiryNotificationAsync(
            string currentUserId)
    {
        var today =
            DateTime.UtcNow.Date;

        var limit =
            today.AddDays(2);

        var expiringDelegations =
            await _context
                .GroupManagerDelegations
                .AsNoTracking()
                .Include(item =>
                    item.Group)
                .Where(item =>
                    item.IsActive &&
                    item.StartDate <= today &&
                    item.EndDate >= today &&
                    item.EndDate <= limit &&
                    (
                        item.DelegateUserId ==
                            currentUserId ||
                        item.OriginalManagerUserId ==
                            currentUserId
                    ))
                .ToListAsync();

        foreach (var delegation in expiringDelegations)
        {
            var daysLeft =
                (
                    delegation.EndDate.Date -
                    today
                ).Days;

            var title =
                "Vekalet süresi yaklaşıyor";

            var roleText =
                delegation.DelegateUserId ==
                currentUserId
                    ? "yönetici vekaletiniz"
                    : "verdiğiniz yönetici vekaleti";

            var timeText =
                daysLeft == 0
                    ? "bugün sona erecek"
                    : daysLeft == 1
                        ? "yarın sona erecek"
                        : $"{daysLeft} gün sonra sona erecek";

            var message =
                $"\"{delegation.Group.Name}\" grubu için {roleText} {timeText}.";

            var alreadyExists =
                await _context.Notifications
                    .AsNoTracking()
                    .AnyAsync(notification =>
                        notification.UserId ==
                            currentUserId &&
                        notification.Title ==
                            title &&
                        notification.Message ==
                            message);

            if (!alreadyExists)
            {
                _context.Notifications.Add(
                    new Notification
                    {
                        UserId = currentUserId,
                        Title = title,
                        Message = message,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        TaskItemId = null
                    });
            }
        }

        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }
    }

    private static string ResolveCategory(
        string title)
    {
        var value =
            title.ToLowerInvariant();

        if (value.Contains("sohbet")) return "chat";

        if (value.Contains("vekalet"))
        {
            return "delegation";
        }

        if (value.Contains("izin"))
        {
            return "leave";
        }

        if (value.Contains("görev"))
        {
            return "task";
        }

        return "system";
    }
}
