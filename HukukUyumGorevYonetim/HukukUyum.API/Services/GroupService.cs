using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Groups;
using HukukUyum.API.Entities;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class GroupService : IGroupService
{
    public async Task<List<ManagedMemberResponseDto>> GetManagedMembersAsync(string currentUserId)
    {
        var groupIds = await _managerDelegationService.GetAccessibleGroupIdsAsync(currentUserId);
        if (groupIds.Count == 0)
        {
            throw new UnauthorizedAccessException("Üyeleri görüntülemek için yönetici veya aktif vekil yetkisi gerekir.");
        }

        var members = await _context.UserGroups.AsNoTracking()
            .Where(m => groupIds.Contains(m.GroupId))
            .Select(m => new ManagedMemberResponseDto
            {
                UserId = m.UserId,
                FullName = m.User.FullName,
                Email = m.User.Email,
                GroupId = m.GroupId,
                GroupName = m.Group.Name,
                IsManager = m.Group.ManagerUserId == m.UserId
            }).ToListAsync();

        var now = DateTime.UtcNow;
        var today = now.Date;
        var counts = await _context.Tasks.AsNoTracking()
            .Where(t => !t.IsDeleted && t.AssignedGroupId.HasValue &&
                groupIds.Contains(t.AssignedGroupId.Value) && t.AssignedUserId != null)
            .GroupBy(t => new { t.AssignedGroupId, t.AssignedUserId })
            .Select(g => new
            {
                g.Key.AssignedGroupId,
                g.Key.AssignedUserId,
                New = g.Count(t => t.Status == HukukUyum.API.Enums.TaskStatus.New),
                InProgress = g.Count(t => t.Status == HukukUyum.API.Enums.TaskStatus.InProgress),
                OnHold = g.Count(t => t.Status == HukukUyum.API.Enums.TaskStatus.OnHold),
                Completed = g.Count(t => t.Status == HukukUyum.API.Enums.TaskStatus.Completed),
                Overdue = g.Count(t => t.DueDate.HasValue && t.DueDate.Value < now &&
                    (t.Status == HukukUyum.API.Enums.TaskStatus.New ||
                     t.Status == HukukUyum.API.Enums.TaskStatus.InProgress ||
                     t.Status == HukukUyum.API.Enums.TaskStatus.OnHold))
            }).ToListAsync();

        var userIds = members.Select(m => m.UserId).Distinct().ToList();
        var onLeave = await _context.LeaveRequests.AsNoTracking()
            .Where(l => userIds.Contains(l.UserId) &&
                l.Status == HukukUyum.API.Enums.LeaveStatus.Approved &&
                l.StartDate <= today && l.EndDate >= today)
            .Select(l => l.UserId).Distinct().ToListAsync();
        var countLookup = counts.ToDictionary(c => (c.AssignedGroupId!.Value, c.AssignedUserId!));
        var onLeaveIds = onLeave.ToHashSet();
        foreach (var member in members)
        {
            member.IsOnLeave = onLeaveIds.Contains(member.UserId);
            if (countLookup.TryGetValue((member.GroupId, member.UserId), out var count))
            {
                member.NewTaskCount = count.New;
                member.InProgressTaskCount = count.InProgress;
                member.OnHoldTaskCount = count.OnHold;
                member.CompletedTaskCount = count.Completed;
                member.OverdueTaskCount = count.Overdue;
            }
        }
        return members.OrderBy(m => m.GroupName).ThenBy(m => m.FullName).ToList();
    }

    private readonly ApplicationDbContext _context;
    private readonly IManagerDelegationService
        _managerDelegationService;

    public GroupService(
        ApplicationDbContext context,
        IManagerDelegationService managerDelegationService)
    {
        _context = context;
        _managerDelegationService =
            managerDelegationService;
    }

    public async Task<GroupResponseDto?>
        UpdateGroupManagerAsync(
            int groupId,
            string managerUserId)
    {
        if (string.IsNullOrWhiteSpace(
                managerUserId))
        {
            throw new InvalidOperationException(
                "Grup yöneticisi seçilmelidir.");
        }

        var group =
            await _context.Groups
                .FirstOrDefaultAsync(
                    group =>
                        group.Id ==
                        groupId);

        if (group is null)
        {
            return null;
        }

        var manager =
            await _context.Users
                .AsNoTracking()
                .Where(user =>
                    user.Id ==
                    managerUserId)
                .Select(user =>
                    new
                    {
                        user.Id,
                        user.FullName,
                        user.Email
                    })
                .FirstOrDefaultAsync();

        if (manager is null)
        {
            throw new InvalidOperationException(
                "Seçilen kullanıcı bulunamadı.");
        }

        var isManager =
            await (
                from userRole
                    in _context.UserRoles

                join role
                    in _context.Roles
                    on userRole.RoleId
                    equals role.Id

                where
                    userRole.UserId ==
                        managerUserId &&
                    role.Name ==
                        "Manager"

                select userRole
            )
            .AnyAsync();

        if (!isManager)
        {
            throw new InvalidOperationException(
                "Grup yöneticisi olarak yalnızca Manager rolüne sahip kullanıcı seçilebilir.");
        }

        group.ManagerUserId =
            managerUserId;

        var membershipExists =
            await _context.UserGroups
                .AnyAsync(userGroup =>
                    userGroup.GroupId ==
                        groupId &&
                    userGroup.UserId ==
                        managerUserId);

        if (!membershipExists)
        {
            _context.UserGroups.Add(
                new UserGroup
                {
                    GroupId =
                        groupId,

                    UserId =
                        managerUserId
                });
        }

        await _context.SaveChangesAsync();

        var userCount =
            await _context.UserGroups
                .CountAsync(userGroup =>
                    userGroup.GroupId ==
                        groupId);

        return new GroupResponseDto
        {
            Id =
                group.Id,

            Name =
                group.Name,

            CreatedAt =
                group.CreatedAt,

            UserCount =
                userCount,

            ManagerUserId =
                manager.Id,

            ManagerFullName =
                manager.FullName,

            ManagerEmail =
                manager.Email ??
                string.Empty
        };
    }

    public async Task<
        List<GroupUserResponseDto>>
        GetGroupUsersAsync(
            int groupId)
    {
        var managerUserId =
            await _context.Groups
                .AsNoTracking()
                .Where(group =>
                    group.Id ==
                    groupId)
                .Select(group =>
                    group.ManagerUserId)
                .FirstOrDefaultAsync();

        return await _context.UserGroups
            .AsNoTracking()
            .Where(userGroup =>
                userGroup.GroupId ==
                    groupId)
            .Select(userGroup =>
                new GroupUserResponseDto
                {
                    UserId =
                        userGroup.UserId,

                    FullName =
                        userGroup.User
                            .FullName,

                    Email =
                        userGroup.User
                            .Email ??
                        string.Empty,

                    IsManager =
                        userGroup.UserId ==
                        managerUserId
                })
            .OrderByDescending(user =>
                user.IsManager)
            .ThenBy(user =>
                user.FullName)
            .ToListAsync();
    }

    public async Task<
        List<GroupResponseDto>>
        GetAllAsync(
            string currentUserId,
            bool canViewAllGroups)
    {
        var query =
            _context.Groups
                .AsNoTracking()
                .AsQueryable();

        if (!canViewAllGroups)
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        currentUserId);

            query =
                query.Where(group =>
                    accessibleGroupIds.Contains(
                        group.Id));
        }

        return await query
            .Select(group =>
                new GroupResponseDto
                {
                    Id =
                        group.Id,

                    Name =
                        group.Name,

                    CreatedAt =
                        group.CreatedAt,

                    UserCount =
                        group.UserGroups.Count,

                    ManagerUserId =
                        group.ManagerUserId ??
                        string.Empty,

                    ManagerFullName =
                        group.ManagerUser != null
                            ? group.ManagerUser.FullName
                            : string.Empty,

                    ManagerEmail =
                        group.ManagerUser != null
                            ? group.ManagerUser.Email ??
                              string.Empty
                            : string.Empty
                })
            .OrderBy(group =>
                group.Name)
            .ToListAsync();
    }

    public async Task<GroupResponseDto?>
        GetByIdAsync(
            int id)
    {
        return await _context.Groups
            .AsNoTracking()
            .Where(group =>
                group.Id == id)
            .Select(group =>
                new GroupResponseDto
                {
                    Id =
                        group.Id,

                    Name =
                        group.Name,

                    CreatedAt =
                        group.CreatedAt,

                    UserCount =
                        group.UserGroups.Count,

                    ManagerUserId =
                        group.ManagerUserId ??
                        string.Empty,

                    ManagerFullName =
                        group.ManagerUser != null
                            ? group.ManagerUser.FullName
                            : string.Empty,

                    ManagerEmail =
                        group.ManagerUser != null
                            ? group.ManagerUser.Email ??
                              string.Empty
                            : string.Empty
                })
            .FirstOrDefaultAsync();
    }

    public async Task<GroupResponseDto>
        CreateAsync(
            CreateGroupDto dto)
    {
        var groupName =
            dto.Name.Trim();

        var managerUserId =
            dto.ManagerUserId.Trim();

        if (string.IsNullOrWhiteSpace(
                managerUserId))
        {
            throw new InvalidOperationException(
                "Grup yöneticisi seçilmelidir.");
        }

        var groupExists =
            await _context.Groups
                .AnyAsync(group =>
                    group.Name ==
                    groupName);

        if (groupExists)
        {
            throw new InvalidOperationException(
                "Bu isimde bir grup zaten bulunmaktadır.");
        }

        var manager =
            await _context.Users
                .AsNoTracking()
                .Where(user =>
                    user.Id ==
                    managerUserId)
                .Select(user =>
                    new
                    {
                        user.Id,
                        user.FullName,
                        user.Email
                    })
                .FirstOrDefaultAsync();

        if (manager is null)
        {
            throw new InvalidOperationException(
                "Seçilen grup yöneticisi bulunamadı.");
        }

        var managerRoleExists =
            await (
                from userRole
                    in _context.UserRoles

                join role
                    in _context.Roles
                    on userRole.RoleId
                    equals role.Id

                where
                    userRole.UserId ==
                        managerUserId &&
                    role.Name ==
                        "Manager"

                select userRole
            )
            .AnyAsync();

        if (!managerRoleExists)
        {
            throw new InvalidOperationException(
                "Grup yöneticisi olarak yalnızca Manager rolüne sahip bir kullanıcı seçilebilir.");
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            var group =
                new Group
                {
                    Name =
                        groupName,

                    CreatedAt =
                        DateTime.UtcNow,

                    ManagerUserId =
                        managerUserId
                };

            _context.Groups.Add(
                group);

            await _context
                .SaveChangesAsync();

            var managerMembership =
                new UserGroup
                {
                    GroupId =
                        group.Id,

                    UserId =
                        managerUserId
                };

            _context.UserGroups.Add(
                managerMembership);

            await _context
                .SaveChangesAsync();

            await transaction
                .CommitAsync();

            return new GroupResponseDto
            {
                Id =
                    group.Id,

                Name =
                    group.Name,

                CreatedAt =
                    group.CreatedAt,

                UserCount =
                    1,

                ManagerUserId =
                    manager.Id,

                ManagerFullName =
                    manager.FullName,

                ManagerEmail =
                    manager.Email ??
                    string.Empty
            };
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }

    public async Task<bool>
        AddUserToGroupAsync(
            int groupId,
            string userId)
    {
        var groupExists =
            await _context.Groups
                .AnyAsync(group =>
                    group.Id ==
                    groupId);

        if (!groupExists)
        {
            return false;
        }

        var userExists =
            await _context.Users
                .AnyAsync(user =>
                    user.Id ==
                    userId);

        if (!userExists)
        {
            return false;
        }

        var membershipExists =
            await _context.UserGroups
                .AnyAsync(userGroup =>
                    userGroup.GroupId ==
                        groupId &&
                    userGroup.UserId ==
                        userId);

        if (membershipExists)
        {
            return false;
        }

        var userGroup =
            new UserGroup
            {
                GroupId =
                    groupId,

                UserId =
                    userId
            };

        _context.UserGroups.Add(
            userGroup);

        await _context
            .SaveChangesAsync();

        return true;
    }

    public async Task<bool>
        RemoveUserFromGroupAsync(
            int groupId,
            string userId)
    {
        var group =
            await _context.Groups
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    group =>
                        group.Id ==
                        groupId);

        if (group is null)
        {
            return false;
        }

        if (group.ManagerUserId ==
            userId)
        {
            throw new InvalidOperationException(
                "Grup yöneticisi gruptan çıkarılamaz. Önce grup yöneticisini değiştirmelisiniz.");
        }

        var userGroup =
            await _context.UserGroups
                .FirstOrDefaultAsync(
                    userGroup =>
                        userGroup.GroupId ==
                            groupId &&
                        userGroup.UserId ==
                            userId);

        if (userGroup is null)
        {
            return false;
        }

        _context.UserGroups.Remove(
            userGroup);

        await _context
            .SaveChangesAsync();

        return true;
    }
}
