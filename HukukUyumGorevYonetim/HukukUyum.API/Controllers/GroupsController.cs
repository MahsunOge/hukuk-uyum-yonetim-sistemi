using HukukUyum.API.DTOs.Groups;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HukukUyum.API.Data;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;
    private readonly ApplicationDbContext _context;
    private readonly IManagerDelegationService _delegations;

    public GroupsController(
        IGroupService groupService, ApplicationDbContext context,
        IManagerDelegationService delegations)
    {
        _context = context;
        _delegations = delegations;
        _groupService = groupService;
    }

    private async Task<bool> CanReadGroupAsync(int groupId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return false;
        if (User.IsInRole("Admin")) return true;
        var groupIds = await _delegations.GetAccessibleGroupIdsAsync(userId);
        return groupIds.Contains(groupId) || await _context.UserGroups.AsNoTracking()
            .AnyAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    [HttpGet]
    public async Task<
        ActionResult<List<GroupResponseDto>>>
        GetAll()
    {
        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId")
            ?? User.FindFirstValue("id");

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var canViewAllGroups =
            User.IsInRole("Admin");

        var groups =
            await _groupService.GetAllAsync(
                currentUserId,
                canViewAllGroups);

        return Ok(groups);
    }

    [HttpGet("managed-members")]
    [Authorize(Roles = "Manager,Employee")]
    public async Task<ActionResult<List<ManagedMemberResponseDto>>> GetManagedMembers()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        return Ok(await _groupService.GetManagedMembersAsync(userId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<
        GroupResponseDto>> GetById(
        int id)
    {
        if (!await CanReadGroupAsync(id)) return Forbid();
        var group =
            await _groupService.GetByIdAsync(
                id);

        if (group is null)
        {
            return NotFound(new
            {
                message =
                    "Grup bulunamadı."
            });
        }

        return Ok(group);
    }

    [HttpGet("{groupId:int}/users")]
    public async Task<ActionResult<
        List<GroupUserResponseDto>>> GetGroupUsers(
        int groupId)
    {
        if (!await CanReadGroupAsync(groupId)) return Forbid();
        var group =
            await _groupService.GetByIdAsync(
                groupId);

        if (group is null)
        {
            return NotFound(new
            {
                message =
                    "Grup bulunamadı."
            });
        }

        var users =
            await _groupService
                .GetGroupUsersAsync(
                    groupId);

        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<
        GroupResponseDto>> Create(
        CreateGroupDto dto)
    {
        try
        {
            var createdGroup =
                await _groupService
                    .CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id =
                        createdGroup.Id
                },
                createdGroup);
        }
        catch (
            InvalidOperationException exception)
        {
            return Conflict(new
            {
                message =
                    exception.Message
            });
        }
    }

    [HttpPost("{groupId:int}/users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        AddUserToGroup(
            int groupId,
            AddUserToGroupDto dto)
    {
        var result =
            await _groupService
                .AddUserToGroupAsync(
                    groupId,
                    dto.UserId);

        if (!result)
        {
            return BadRequest(new
            {
                message =
                    "Grup veya kullanıcı bulunamadı ya da kullanıcı zaten bu gruba üyedir."
            });
        }

        return Ok(new
        {
            message =
                "Kullanıcı gruba başarıyla eklendi."
        });
    }

    [HttpPut("{groupId:int}/manager")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<
        GroupResponseDto>> UpdateManager(
        int groupId,
        UpdateGroupManagerDto dto)
    {
        try
        {
            var updatedGroup =
                await _groupService
                    .UpdateGroupManagerAsync(
                        groupId,
                        dto.ManagerUserId);

            if (updatedGroup is null)
            {
                return NotFound(new
                {
                    message =
                        "Grup bulunamadı."
                });
            }

            return Ok(updatedGroup);
        }
        catch (
            InvalidOperationException exception)
        {
            return BadRequest(new
            {
                message =
                    exception.Message
            });
        }
    }

    [HttpDelete(
        "{groupId:int}/users/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        RemoveUserFromGroup(
            int groupId,
            string userId)
    {
        var result =
            await _groupService
                .RemoveUserFromGroupAsync(
                    groupId,
                    userId);

        if (!result)
        {
            return NotFound(new
            {
                message =
                    "Kullanıcı bu grupta bulunamadı."
            });
        }

        return Ok(new
        {
            message =
                "Kullanıcı gruptan başarıyla çıkarıldı."
        });
    }
}
