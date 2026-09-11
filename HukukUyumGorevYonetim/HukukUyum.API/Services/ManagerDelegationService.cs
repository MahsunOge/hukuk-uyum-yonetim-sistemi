using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Delegations;
using HukukUyum.API.Entities;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class ManagerDelegationService
    : IManagerDelegationService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public ManagerDelegationService(
        ApplicationDbContext context,
        IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<ManagerDelegationResponseDto>
        CreateAsync(
            string currentUserId,
            bool isAdmin,
            CreateManagerDelegationDto dto)
    {
        var startDate =
            dto.StartDate.Date;

        var endDate =
            dto.EndDate.Date;

        if (endDate < startDate)
        {
            throw new ArgumentException(
                "Vekalet bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        if (string.IsNullOrWhiteSpace(
            dto.DelegateUserId))
        {
            throw new ArgumentException(
                "Vekil kullanıcı seçilmelidir.");
        }

        var group =
            await _context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item =>
                        item.Id ==
                        dto.GroupId);

        if (group is null)
        {
            throw new ArgumentException(
                "Grup bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(
            group.ManagerUserId))
        {
            throw new ArgumentException(
                "Seçilen grubun tanımlı bir yöneticisi bulunmuyor.");
        }

        if (!isAdmin &&
            group.ManagerUserId != currentUserId)
        {
            throw new UnauthorizedAccessException(
                "Yalnızca kendi yönettiğiniz grup için vekil belirleyebilirsiniz.");
        }

        if (group.ManagerUserId ==
            dto.DelegateUserId)
        {
            throw new ArgumentException(
                "Grup yöneticisi kendisini vekil olarak seçemez.");
        }

        var delegateUser =
            await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    user =>
                        user.Id ==
                        dto.DelegateUserId);

        if (delegateUser is null)
        {
            throw new ArgumentException(
                "Vekil kullanıcı bulunamadı.");
        }

        var delegateIsGroupMember =
            await _context.UserGroups
                .AsNoTracking()
                .AnyAsync(
                    userGroup =>
                        userGroup.GroupId ==
                            dto.GroupId &&
                        userGroup.UserId ==
                            dto.DelegateUserId);

        if (!delegateIsGroupMember)
        {
            throw new ArgumentException(
                "Vekil kullanıcı seçilen grubun üyesi olmalıdır.");
        }

        var delegateIsEmployee =
            await (
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
                        dto.DelegateUserId &&
                    role.Name ==
                        "Employee"

                select userRole
            ).AnyAsync();

        if (!delegateIsEmployee)
        {
            throw new ArgumentException(
                "Vekil kullanıcı Employee rolüne sahip olmalıdır.");
        }

        var conflictingDelegation =
            await _context.GroupManagerDelegations
                .AsNoTracking()
                .AnyAsync(
                    delegation =>
                        delegation.GroupId ==
                            dto.GroupId &&
                        delegation.IsActive &&
                        startDate <=
                            delegation.EndDate &&
                        endDate >=
                            delegation.StartDate);

        if (conflictingDelegation)
        {
            throw new ArgumentException(
                "Seçilen tarih aralığında bu grup için aktif veya planlanmış başka bir vekalet bulunmaktadır.");
        }

        var delegation =
            new GroupManagerDelegation
            {
                GroupId =
                    dto.GroupId,

                OriginalManagerUserId =
                    group.ManagerUserId,

                DelegateUserId =
                    dto.DelegateUserId,

                StartDate =
                    startDate,

                EndDate =
                    endDate,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow,

                CreatedByUserId =
                    currentUserId
            };

        _context.GroupManagerDelegations.Add(
            delegation);

        await _context.SaveChangesAsync();

        _context.Notifications.Add(
            new Notification
            {
                UserId = dto.DelegateUserId,
                Title = "Yönetici vekaleti oluşturuldu",
                Message =
                    $"\"{group.Name}\" grubu için {startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy} tarihleri arasında yönetici vekili olarak görevlendirildiniz.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                TaskItemId = null
            });

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            currentUserId,
            "DELEGATION_CREATED",
            "GroupManagerDelegation",
            delegation.Id.ToString(),
            $"\"{group.Name}\" grubu için {delegateUser.FullName} kullanıcısına {startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy} tarihleri arasında yönetici vekaleti oluşturuldu.");

        return await BuildResponseQuery()
            .FirstAsync(
                item =>
                    item.Id ==
                    delegation.Id);
    }

    public async Task<
        List<ManagerDelegationResponseDto>>
        GetAllAsync()
    {
        return await BuildResponseQuery()
            .OrderByDescending(
                item =>
                    item.CreatedAt)
            .ToListAsync();
    }

    public async Task<
        List<ManagerDelegationResponseDto>>
        GetMyDelegationsAsync(
            string currentUserId)
    {
        return await BuildResponseQuery()
            .Where(
                item =>
                    item.DelegateUserId ==
                        currentUserId ||
                    item.OriginalManagerUserId ==
                        currentUserId)
            .OrderByDescending(
                item =>
                    item.CreatedAt)
            .ToListAsync();
    }

    public async Task<ManagerDelegationOptionsDto>
        GetOptionsAsync(
            string currentUserId,
            bool isAdmin)
    {
        var groupQuery =
            _context.Groups
                .AsNoTracking()
                .Where(groupItem =>
                    groupItem.ManagerUserId != null);

        if (!isAdmin)
        {
            groupQuery =
                groupQuery.Where(groupItem =>
                    groupItem.ManagerUserId ==
                        currentUserId);
        }

        var groups =
            await groupQuery
                .OrderBy(groupItem =>
                    groupItem.Name)
                .Select(groupItem =>
                    new
                    {
                        groupItem.Id,
                        groupItem.Name,
                        ManagerUserId =
                            groupItem.ManagerUserId!,
                        ManagerFullName =
                            groupItem.ManagerUser != null
                                ? groupItem.ManagerUser.FullName
                                : string.Empty
                    })
                .ToListAsync();

        var result =
            new ManagerDelegationOptionsDto();

        foreach (var groupItem in groups)
        {
            var employees =
                await (
                    from userGroup
                        in _context.UserGroups
                            .AsNoTracking()

                    join user
                        in _context.Users
                            .AsNoTracking()
                        on userGroup.UserId
                        equals user.Id

                    join userRole
                        in _context.UserRoles
                            .AsNoTracking()
                        on user.Id
                        equals userRole.UserId

                    join role
                        in _context.Roles
                            .AsNoTracking()
                        on userRole.RoleId
                        equals role.Id

                    where
                        userGroup.GroupId ==
                            groupItem.Id &&
                        role.Name ==
                            "Employee"

                    orderby
                        user.FullName

                    select
                        new ManagerDelegationEmployeeOptionDto
                        {
                            UserId =
                                user.Id,

                            FullName =
                                user.FullName,

                            Email =
                                user.Email
                        }
                )
                .Distinct()
                .ToListAsync();

            result.Groups.Add(
                new ManagerDelegationGroupOptionDto
                {
                    GroupId =
                        groupItem.Id,

                    GroupName =
                        groupItem.Name,

                    ManagerUserId =
                        groupItem.ManagerUserId,

                    ManagerFullName =
                        groupItem.ManagerFullName,

                    Employees =
                        employees
                });
        }

        return result;
    }

    public async Task<bool> EndAsync(
        int id,
        string currentUserId,
        bool isAdmin)
    {
        var delegation =
            await _context
                .GroupManagerDelegations
                .Include(
                    item =>
                        item.Group)
                .Include(
                    item =>
                        item.DelegateUser)
                .FirstOrDefaultAsync(
                    item =>
                        item.Id == id);

        if (delegation is null)
        {
            return false;
        }

        if (!isAdmin &&
            delegation.OriginalManagerUserId !=
                currentUserId)
        {
            throw new UnauthorizedAccessException(
                "Yalnızca kendi grubunuz için oluşturulan vekaleti sona erdirebilirsiniz.");
        }

        if (!delegation.IsActive)
        {
            throw new ArgumentException(
                "Bu vekalet zaten sona erdirilmiş.");
        }

        delegation.IsActive =
            false;

        await _context.SaveChangesAsync();

        _context.Notifications.Add(
            new Notification
            {
                UserId = delegation.DelegateUserId,
                Title = "Yönetici vekaleti sona erdi",
                Message =
                    $"\"{delegation.Group.Name}\" grubu için yönetici vekaletiniz sona erdirildi.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                TaskItemId = null
            });

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            currentUserId,
            "DELEGATION_ENDED",
            "GroupManagerDelegation",
            delegation.Id.ToString(),
            $"\"{delegation.Group.Name}\" grubu için {delegation.DelegateUser.FullName} kullanıcısına verilen yönetici vekaleti sona erdirildi.");

        return true;
    }

    public async Task<bool>
        HasActiveManagerAccessAsync(
            string userId,
            int groupId)
    {
        var group =
            await _context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item =>
                        item.Id ==
                        groupId);

        if (group is null)
        {
            return false;
        }

        if (group.ManagerUserId ==
            userId)
        {
            return true;
        }

        var today =
            DateTime.UtcNow.Date;

        return await _context
            .GroupManagerDelegations
            .AsNoTracking()
            .AnyAsync(
                delegation =>
                    delegation.GroupId ==
                        groupId &&
                    delegation.DelegateUserId ==
                        userId &&
                    delegation.IsActive &&
                    delegation.StartDate <=
                        today &&
                    delegation.EndDate >=
                        today);
    }

    public async Task<List<int>>
        GetAccessibleGroupIdsAsync(
            string userId)
    {
        var today =
            DateTime.UtcNow.Date;

        var permanentGroupIds =
            _context.Groups
                .AsNoTracking()
                .Where(
                    group =>
                        group.ManagerUserId ==
                        userId)
                .Select(
                    group =>
                        group.Id);

        var delegatedGroupIds =
            _context.GroupManagerDelegations
                .AsNoTracking()
                .Where(
                    delegation =>
                        delegation.DelegateUserId ==
                            userId &&
                        delegation.IsActive &&
                        delegation.StartDate <=
                            today &&
                        delegation.EndDate >=
                            today)
                .Select(
                    delegation =>
                        delegation.GroupId);

        return await permanentGroupIds
            .Concat(
                delegatedGroupIds)
            .Distinct()
            .ToListAsync();
    }

    private IQueryable<
        ManagerDelegationResponseDto>
        BuildResponseQuery()
    {
        var today =
            DateTime.UtcNow.Date;

        return _context
            .GroupManagerDelegations
            .AsNoTracking()
            .Select(
                delegation =>
                    new ManagerDelegationResponseDto
                    {
                        Id =
                            delegation.Id,

                        GroupId =
                            delegation.GroupId,

                        GroupName =
                            delegation.Group.Name,

                        OriginalManagerUserId =
                            delegation.OriginalManagerUserId,

                        OriginalManagerFullName =
                            delegation.OriginalManagerUser.FullName,

                        DelegateUserId =
                            delegation.DelegateUserId,

                        DelegateUserFullName =
                            delegation.DelegateUser.FullName,

                        StartDate =
                            delegation.StartDate,

                        EndDate =
                            delegation.EndDate,

                        IsActive =
                            delegation.IsActive,

                        IsCurrentlyEffective =
                            delegation.IsActive &&
                            delegation.StartDate <=
                                today &&
                            delegation.EndDate >=
                                today,

                        CreatedAt =
                            delegation.CreatedAt,

                        CreatedByUserId =
                            delegation.CreatedByUserId,

                        CreatedByUserFullName =
                            delegation.CreatedByUser.FullName
                    });
    }
}
