using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Leaves;
using HukukUyum.API.Entities;
using HukukUyum.API.Enums;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class LeaveService : ILeaveService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly IManagerDelegationService _managerDelegationService;

    public LeaveService(
        ApplicationDbContext context,
        IAuditLogService auditLogService,
        IManagerDelegationService managerDelegationService)
    {
        _context = context;
        _auditLogService = auditLogService;
        _managerDelegationService = managerDelegationService;
    }

    public async Task<LeaveRequestResponseDto> CreateAsync(
        string currentUserId,
        CreateLeaveRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            throw new UnauthorizedAccessException(
                "Oturum açmış kullanıcı bilgisi bulunamadı.");
        }

        if (!Enum.IsDefined(dto.LeaveType))
        {
            throw new ArgumentException(
                "Geçerli bir izin türü seçilmelidir.");
        }

        var startDate = dto.StartDate.Date;
        var endDate = dto.EndDate.Date;

        if (endDate < startDate)
        {
            throw new ArgumentException(
                "İzin bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        var userExists =
            await _context.Users
                .AsNoTracking()
                .AnyAsync(user =>
                    user.Id == currentUserId);

        if (!userExists)
        {
            throw new ArgumentException(
                "Kullanıcı bulunamadı.");
        }

        var hasOverlappingLeave =
            await _context.LeaveRequests
                .AsNoTracking()
                .AnyAsync(leave =>
                    leave.UserId == currentUserId &&
                    (
                        leave.Status == LeaveStatus.Pending ||
                        leave.Status == LeaveStatus.Approved
                    ) &&
                    startDate <= leave.EndDate &&
                    endDate >= leave.StartDate);

        if (hasOverlappingLeave)
        {
            throw new ArgumentException(
                "Seçilen tarih aralığında bekleyen veya onaylanmış başka bir izin kaydınız bulunmaktadır.");
        }

        var leaveRequest =
            new LeaveRequest
            {
                UserId = currentUserId,
                LeaveType = dto.LeaveType,
                StartDate = startDate,
                EndDate = endDate,
                Description =
                    string.IsNullOrWhiteSpace(
                        dto.Description)
                        ? null
                        : dto.Description.Trim(),
                Status = LeaveStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

        _context.LeaveRequests.Add(
            leaveRequest);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            currentUserId,
            "LEAVE_CREATED",
            "LeaveRequest",
            leaveRequest.Id.ToString(),
            $"{startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy} tarihleri için izin talebi oluşturuldu.");

        return await MapAsync(
            leaveRequest);
    }

    public async Task<List<LeaveRequestResponseDto>>
        GetMyLeavesAsync(
            string currentUserId)
    {
        return await BuildResponseQuery()
            .Where(item =>
                item.UserId == currentUserId)
            .OrderByDescending(item =>
                item.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<LeaveRequestResponseDto>>
        GetAllAsync()
    {
        return await BuildResponseQuery()
            .OrderByDescending(item =>
                item.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<LeaveRequestResponseDto>>
        GetManagedGroupLeavesAsync(
            string managerUserId)
    {
        var managedGroupIds =
            await _managerDelegationService
                .GetAccessibleGroupIdsAsync(
                    managerUserId);

        if (managedGroupIds.Count == 0)
        {
            return new List<
                LeaveRequestResponseDto>();
        }

        var groupUserIds =
            _context.UserGroups
                .AsNoTracking()
                .Where(userGroup =>
                    managedGroupIds.Contains(
                        userGroup.GroupId) &&
                    userGroup.UserId !=
                        managerUserId)
                .Select(userGroup =>
                    userGroup.UserId);

        return await BuildResponseQuery()
            .Where(item =>
                groupUserIds.Contains(
                    item.UserId))
            .OrderByDescending(item =>
                item.CreatedAt)
            .ToListAsync();
    }

    public async Task<LeaveRequestResponseDto?>
        GetByIdAsync(
            int id,
            string currentUserId,
            bool isAdmin,
            bool isManager)
    {
        var leaveRequest =
            await _context.LeaveRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(leave =>
                    leave.Id == id);

        if (leaveRequest is null)
        {
            return null;
        }

        if (isAdmin ||
            leaveRequest.UserId ==
                currentUserId)
        {
            return await MapAsync(
                leaveRequest);
        }

        if (isManager)
        {
            var canView =
                await IsUserManagedByAsync(
                    currentUserId,
                    leaveRequest.UserId);

            if (canView)
            {
                return await MapAsync(
                    leaveRequest);
            }
        }

        throw new UnauthorizedAccessException(
            "Bu izin kaydını görüntüleme yetkiniz bulunmuyor.");
    }

    public async Task<bool> ReviewAsync(
        int id,
        string reviewerUserId,
        bool isAdmin,
        bool isManager,
        ReviewLeaveRequestDto dto)
    {
        if (dto.Status != LeaveStatus.Approved &&
            dto.Status != LeaveStatus.Rejected)
        {
            throw new ArgumentException(
                "İzin talebi yalnızca onaylanabilir veya reddedilebilir.");
        }

        if (dto.Status == LeaveStatus.Rejected &&
            string.IsNullOrWhiteSpace(
                dto.RejectionReason))
        {
            throw new ArgumentException(
                "Reddedilen izin talebi için red nedeni girilmelidir.");
        }

        var leaveRequest =
            await _context.LeaveRequests
                .FirstOrDefaultAsync(leave =>
                    leave.Id == id);

        if (leaveRequest is null)
        {
            return false;
        }

        if (leaveRequest.Status !=
            LeaveStatus.Pending)
        {
            throw new ArgumentException(
                "Yalnızca bekleyen izin talepleri değerlendirilebilir.");
        }

        if (leaveRequest.UserId ==
            reviewerUserId)
        {
            throw new UnauthorizedAccessException(
                "Kendi izin talebinizi değerlendiremezsiniz.");
        }

        var requesterIsManager =
            await IsInRoleAsync(
                leaveRequest.UserId,
                "Manager");

        if (requesterIsManager)
        {
            if (!isAdmin)
            {
                throw new UnauthorizedAccessException(
                    "Yönetici izin talepleri yalnızca Admin tarafından değerlendirilebilir.");
            }
        }
        else
        {
            if (!isAdmin)
            {
                if (!isManager ||
                    !await IsUserManagedByAsync(
                        reviewerUserId,
                        leaveRequest.UserId))
                {
                    throw new UnauthorizedAccessException(
                        "Yalnızca kendi grubunuzdaki çalışanların izin taleplerini değerlendirebilirsiniz.");
                }
            }
        }

        leaveRequest.Status =
            dto.Status;

        leaveRequest.ReviewedByUserId =
            reviewerUserId;

        leaveRequest.ReviewedAt =
            DateTime.UtcNow;

        leaveRequest.RejectionReason =
            dto.Status ==
                LeaveStatus.Rejected
                ? dto.RejectionReason!.Trim()
                : null;

        await _context.SaveChangesAsync();

        var action =
            dto.Status ==
                LeaveStatus.Approved
                ? "LEAVE_APPROVED"
                : "LEAVE_REJECTED";

        var actionText =
            dto.Status ==
                LeaveStatus.Approved
                ? "onaylandı"
                : "reddedildi";

        await _auditLogService.LogAsync(
            reviewerUserId,
            action,
            "LeaveRequest",
            leaveRequest.Id.ToString(),
            $"{leaveRequest.StartDate:dd.MM.yyyy} - {leaveRequest.EndDate:dd.MM.yyyy} tarihli izin talebi {actionText}.");

        return true;
    }

    public async Task<bool> CancelAsync(
        int id,
        string currentUserId,
        bool isAdmin,
        CancelLeaveRequestDto dto)
    {
        var reason = dto.Reason?.Trim() ?? "";
        if (reason.Length < 3 || reason.Length > 500)
            throw new ArgumentException("İptal gerekçesi 3–500 karakter olmalıdır.");
        var leaveRequest =
            await _context.LeaveRequests
                .FirstOrDefaultAsync(leave =>
                    leave.Id == id);

        if (leaveRequest is null)
        {
            return false;
        }

        var isOwner = leaveRequest.UserId == currentUserId;

        if (!isOwner && !isAdmin)
        {
            // Yönetici izinleri için mevcut üst yönetim yetki sınırını koru.
            if (!await IsUserManagedByAsync(currentUserId, leaveRequest.UserId) ||
                await IsInRoleAsync(leaveRequest.UserId, "Manager"))
            {
                throw new UnauthorizedAccessException(
                    "Yalnızca yönettiğiniz gruplardaki çalışanların izinlerini iptal edebilirsiniz. Yönetici izinleri bu kapsama dahil değildir.");
            }
        }

        if (isOwner && !isAdmin && leaveRequest.Status != LeaveStatus.Pending)
        {
            throw new ArgumentException(
                "Kendi izinlerinizden yalnızca bekleyen talepleri iptal edebilirsiniz.");
        }

        if (leaveRequest.Status != LeaveStatus.Pending &&
            leaveRequest.Status != LeaveStatus.Approved)
        {
            throw new ArgumentException(
                "Yalnızca bekleyen veya onaylanmış izinler iptal edilebilir.");
        }

        leaveRequest.Status =
            LeaveStatus.Cancelled;

        var explanation = $"{leaveRequest.StartDate:dd.MM.yyyy} - {leaveRequest.EndDate:dd.MM.yyyy} tarihli izin {(isAdmin ? "Admin" : isOwner ? "talep sahibi" : "grup yöneticisi veya aktif vekil")} tarafından iptal edildi. Gerekçe: {reason}";
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUserId, Action = "LEAVE_CANCELLED", EntityType = "LeaveRequest",
            EntityId = leaveRequest.Id.ToString(), Description = explanation, CreatedAt = DateTime.UtcNow
        });
        if (!isOwner)
            _context.Notifications.Add(new Notification
            {
                UserId = leaveRequest.UserId, Title = "İzniniz iptal edildi",
                Message = explanation, CreatedAt = DateTime.UtcNow
            });
        // Durum, gerekçe kaydı ve bildirim aynı işlemde saklanır.
        await _context.SaveChangesAsync();

        return true;
    }

    private IQueryable<LeaveRequestResponseDto>
        BuildResponseQuery()
    {
        return _context.LeaveRequests
            .AsNoTracking()
            .Select(leave =>
                new LeaveRequestResponseDto
                {
                    Id =
                        leave.Id,

                    UserId =
                        leave.UserId,

                    UserFullName =
                        leave.User.FullName,

                    GroupId =
                        _context.UserGroups
                            .Where(userGroup =>
                                userGroup.UserId ==
                                    leave.UserId)
                            .OrderBy(userGroup =>
                                userGroup.GroupId)
                            .Select(userGroup =>
                                (int?)userGroup.GroupId)
                            .FirstOrDefault(),

                    GroupName =
                        _context.UserGroups
                            .Where(userGroup =>
                                userGroup.UserId ==
                                    leave.UserId)
                            .OrderBy(userGroup =>
                                userGroup.GroupId)
                            .Select(userGroup =>
                                userGroup.Group.Name)
                            .FirstOrDefault(),

                    LeaveType =
                        leave.LeaveType,

                    StartDate =
                        leave.StartDate,

                    EndDate =
                        leave.EndDate,

                    Description =
                        leave.Description,

                    Status =
                        leave.Status,

                    ReviewedByUserId =
                        leave.ReviewedByUserId,

                    ReviewedByUserFullName =
                        leave.ReviewedByUser != null
                            ? leave.ReviewedByUser
                                .FullName
                            : null,

                    ReviewedAt =
                        leave.ReviewedAt,

                    CancellationDescription = _context.AuditLogs
                        .Where(log => log.EntityType == "LeaveRequest" && log.EntityId == leave.Id.ToString()
                            && log.Action == "LEAVE_CANCELLED")
                        .OrderByDescending(log => log.Id).Select(log => log.Description).FirstOrDefault(),

                    RejectionReason =
                        leave.RejectionReason,

                    CreatedAt =
                        leave.CreatedAt
                });
    }

    private async Task<
        LeaveRequestResponseDto>
        MapAsync(
            LeaveRequest leaveRequest)
    {
        return await BuildResponseQuery()
            .FirstAsync(item =>
                item.Id ==
                    leaveRequest.Id);
    }

    private async Task<bool>
        IsUserManagedByAsync(
            string managerUserId,
            string userId)
    {
        var accessibleGroupIds =
            await _managerDelegationService
                .GetAccessibleGroupIdsAsync(
                    managerUserId);

        if (accessibleGroupIds.Count == 0)
        {
            return false;
        }

        return await _context.UserGroups
            .AsNoTracking()
            .AnyAsync(userGroup =>
                userGroup.UserId ==
                    userId &&
                accessibleGroupIds.Contains(
                    userGroup.GroupId));
    }

    private async Task<bool>
        IsInRoleAsync(
            string userId,
            string roleName)
    {
        return await (
            from userRole
                in _context.UserRoles
                    .AsNoTracking()

            join role
                in _context.Roles
                    .AsNoTracking()
                on userRole.RoleId
                equals role.Id

            where
                userRole.UserId ==
                    userId &&
                role.Name ==
                    roleName

            select userRole
        ).AnyAsync();
    }
}
