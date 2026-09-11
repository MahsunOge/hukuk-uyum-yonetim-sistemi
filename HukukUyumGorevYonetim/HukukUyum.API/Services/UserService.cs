using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Users;
using HukukUyum.API.Entities;
using HukukUyum.API.Identity;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class UserService : IUserService
{
    private static readonly string[] AllowedRoles =
    {
        "Admin",
        "Manager",
        "Employee",
        "User"
    };

    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(user => user.FullName)
            .ToListAsync();

        var result = new List<UserResponseDto>();

        foreach (var user in users)
        {
            result.Add(
                await MapToResponseDtoAsync(user));
        }

        return result;
    }

    public async Task<UserResponseDto?> GetByIdAsync(
        string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user is null)
        {
            return null;
        }

        return await MapToResponseDtoAsync(user);
    }

    public async Task<UserResponseDto?> UpdateAsync(
        string id,
        UpdateUserDto updateUserDto)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user is null)
        {
            return null;
        }

        var requestedRoles = updateUserDto.Roles
            .Where(role =>
                !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedRoles.Count == 0)
        {
            throw new InvalidOperationException(
                "Kullanıcıya en az bir rol atanmalıdır.");
        }

        var invalidRole = requestedRoles
            .FirstOrDefault(role =>
                !AllowedRoles.Contains(
                    role,
                    StringComparer.OrdinalIgnoreCase));

        if (invalidRole is not null)
        {
            throw new InvalidOperationException(
                $"Geçersiz rol: {invalidRole}");
        }

        var userRoleSelected = requestedRoles
            .Contains(
                "User",
                StringComparer.OrdinalIgnoreCase);

        if (userRoleSelected &&
            requestedRoles.Count > 1)
        {
            throw new InvalidOperationException(
                "User rolü diğer rollerle birlikte atanamaz.");
        }

        var requestedGroupIds = updateUserDto.GroupIds
            .Distinct()
            .ToList();

        if (userRoleSelected &&
            requestedGroupIds.Count > 0)
        {
            throw new InvalidOperationException(
                "User rolüne sahip kullanıcı bir gruba atanamaz.");
        }

        if (requestedGroupIds.Count > 0)
        {
            var existingGroupIds = await _context.Groups
                .AsNoTracking()
                .Where(group =>
                    requestedGroupIds.Contains(group.Id))
                .Select(group => group.Id)
                .ToListAsync();

            if (existingGroupIds.Count !=
                requestedGroupIds.Count)
            {
                throw new InvalidOperationException(
                    "Seçilen gruplardan biri bulunamadı.");
            }
        }

        var managedGroupIds = await _context.Groups
            .AsNoTracking()
            .Where(group =>
                group.ManagerUserId == id)
            .Select(group => group.Id)
            .ToListAsync();

        var managerRoleSelected = requestedRoles
            .Contains(
                "Manager",
                StringComparer.OrdinalIgnoreCase);

        if (managedGroupIds.Count > 0 &&
            !managerRoleSelected)
        {
            throw new InvalidOperationException(
                "Bu kullanıcı bir veya daha fazla grubun yöneticisidir. Manager rolünü kaldırmadan önce ilgili gruplara başka bir yönetici atayın.");
        }

        var missingManagedGroup = managedGroupIds
            .FirstOrDefault(groupId =>
                !requestedGroupIds.Contains(groupId));

        if (managedGroupIds.Count > 0 &&
            missingManagedGroup != 0)
        {
            throw new InvalidOperationException(
                "Kullanıcı yöneticisi olduğu gruptan çıkarılamaz. Önce grubun yöneticisini değiştirin.");
        }

        var currentRoles =
            await _userManager.GetRolesAsync(user);

        var rolesToRemove = currentRoles
            .Where(currentRole =>
                !requestedRoles.Contains(
                    currentRole,
                    StringComparer.OrdinalIgnoreCase))
            .ToList();

        var rolesToAdd = requestedRoles
            .Where(requestedRole =>
                !currentRoles.Contains(
                    requestedRole,
                    StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (rolesToRemove.Count > 0)
        {
            var removeResult =
                await _userManager.RemoveFromRolesAsync(
                    user,
                    rolesToRemove);

            EnsureIdentityResult(
                removeResult,
                "Kullanıcı rolleri güncellenemedi.");
        }

        if (rolesToAdd.Count > 0)
        {
            var addResult =
                await _userManager.AddToRolesAsync(
                    user,
                    rolesToAdd);

            EnsureIdentityResult(
                addResult,
                "Kullanıcı rolleri güncellenemedi.");
        }

        var existingMemberships =
            await _context.UserGroups
                .Where(userGroup =>
                    userGroup.UserId == id)
                .ToListAsync();

        _context.UserGroups.RemoveRange(
            existingMemberships);

        foreach (var groupId in requestedGroupIds)
        {
            _context.UserGroups.Add(
                new UserGroup
                {
                    UserId = id,
                    GroupId = groupId
                });
        }

        await _context.SaveChangesAsync();

        return await MapToResponseDtoAsync(user);
    }

    public async Task<bool> DeleteAsync(
        string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user is null)
        {
            return false;
        }

        var managedGroups = await _context.Groups
            .AsNoTracking()
            .Where(group =>
                group.ManagerUserId == id)
            .Select(group => group.Name)
            .ToListAsync();

        if (managedGroups.Count > 0)
        {
            throw new InvalidOperationException(
                $"Kullanıcı şu grupların yöneticisidir: {string.Join(", ", managedGroups)}. Kullanıcıyı silmeden önce bu gruplara başka bir yönetici atayın.");
        }

        var memberships =
            await _context.UserGroups
                .Where(userGroup =>
                    userGroup.UserId == id)
                .ToListAsync();

        _context.UserGroups.RemoveRange(
            memberships);

        var notifications =
            await _context.Notifications
                .Where(notification =>
                    notification.UserId == id)
                .ToListAsync();

        _context.Notifications.RemoveRange(
            notifications);

        var relatedTasks =
            await _context.Tasks
                .Where(task =>
                    task.AssignedUserId == id ||
                    task.CreatedByUserId == id)
                .ToListAsync();

        foreach (var task in relatedTasks)
        {
            if (task.AssignedUserId == id)
            {
                task.AssignedUserId = null;
            }

            if (task.CreatedByUserId == id)
            {
                task.CreatedByUserId = null;
            }
        }

        await _context.SaveChangesAsync();

        var deleteResult =
            await _userManager.DeleteAsync(user);

        EnsureIdentityResult(
            deleteResult,
            "Kullanıcı silinemedi.");

        return true;
    }

    private async Task<UserResponseDto>
        MapToResponseDtoAsync(
            ApplicationUser user)
    {
        var roles =
            await _userManager.GetRolesAsync(user);

        var groups =
            await _context.UserGroups
                .AsNoTracking()
                .Where(userGroup =>
                    userGroup.UserId == user.Id)
                .Select(userGroup =>
                    userGroup.Group.Name)
                .OrderBy(groupName =>
                    groupName)
                .ToListAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList(),
            Groups = groups
        };
    }

    private static void EnsureIdentityResult(
        IdentityResult result,
        string fallbackMessage)
    {
        if (result.Succeeded)
        {
            return;
        }

        var message = string.Join(
            " ",
            result.Errors.Select(error =>
                error.Description));

        throw new InvalidOperationException(
            string.IsNullOrWhiteSpace(message)
                ? fallbackMessage
                : message);
    }
}
