using System.Security.Claims;
using HukukUyum.API.DTOs.Leaves;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveRequestsController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly IManagerDelegationService
        _managerDelegationService;

    public LeaveRequestsController(
        ILeaveService leaveService,
        IManagerDelegationService managerDelegationService)
    {
        _leaveService = leaveService;
        _managerDelegationService =
            managerDelegationService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(
            ClaimTypes.NameIdentifier) ??
        throw new UnauthorizedAccessException(
            "Kullanıcı bilgisi bulunamadı.");

    [HttpPost]
    [Authorize(Roles = "Manager,Employee")]
    public async Task<ActionResult<
        LeaveRequestResponseDto>>
        Create(
            CreateLeaveRequestDto dto)
    {
        var result =
            await _leaveService.CreateAsync(
                CurrentUserId,
                dto);

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Manager,Employee")]
    public async Task<ActionResult<
        List<LeaveRequestResponseDto>>>
        GetMyLeaves()
    {
        var result =
            await _leaveService
                .GetMyLeavesAsync(
                    CurrentUserId);

        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<
        List<LeaveRequestResponseDto>>>
        GetAll()
    {
        var result =
            await _leaveService
                .GetAllAsync();

        return Ok(result);
    }

    [HttpGet("managed-group")]
    [Authorize(Roles = "Manager,Employee")]
    public async Task<ActionResult<
        List<LeaveRequestResponseDto>>>
        GetManagedGroupLeaves()
    {
        var accessibleGroupIds =
            await _managerDelegationService
                .GetAccessibleGroupIdsAsync(
                    CurrentUserId);

        if (accessibleGroupIds.Count == 0)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        "Yönetici veya aktif vekil olarak erişebildiğiniz bir grup bulunmuyor."
                });
        }

        var result =
            await _leaveService
                .GetManagedGroupLeavesAsync(
                    CurrentUserId);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(
        Roles = "Admin,Manager,Employee")]
    public async Task<ActionResult<
        LeaveRequestResponseDto>>
        GetById(
            int id)
    {
        var hasManagerAccess =
            User.IsInRole("Manager");

        if (!hasManagerAccess &&
            User.IsInRole("Employee"))
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        CurrentUserId);

            hasManagerAccess =
                accessibleGroupIds.Count > 0;
        }

        var result =
            await _leaveService
                .GetByIdAsync(
                    id,
                    CurrentUserId,
                    User.IsInRole("Admin"),
                    hasManagerAccess);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPatch("{id:int}/review")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        Review(
            int id,
            ReviewLeaveRequestDto dto)
    {
        var isAdmin =
            User.IsInRole("Admin");

        var hasManagerAccess =
            User.IsInRole("Manager");

        if (!isAdmin &&
            !hasManagerAccess)
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        CurrentUserId);

            hasManagerAccess =
                accessibleGroupIds.Count > 0;
        }

        if (!isAdmin &&
            !hasManagerAccess)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        "Bu işlem için yönetici veya aktif vekil yetkiniz bulunmuyor."
                });
        }

        var result =
            await _leaveService
                .ReviewAsync(
                    id,
                    CurrentUserId,
                    isAdmin,
                    hasManagerAccess,
                    dto);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/cancel")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        Cancel(
            int id, CancelLeaveRequestDto dto)
    {
        var result =
            await _leaveService
                .CancelAsync(
                    id,
                    CurrentUserId,
                    User.IsInRole("Admin"), dto);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}
