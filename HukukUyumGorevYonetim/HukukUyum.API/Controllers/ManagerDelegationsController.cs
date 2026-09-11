using System.Security.Claims;
using HukukUyum.API.DTOs.Delegations;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ManagerDelegationsController
    : ControllerBase
{
    private readonly IManagerDelegationService
        _managerDelegationService;

    public ManagerDelegationsController(
        IManagerDelegationService
            managerDelegationService)
    {
        _managerDelegationService =
            managerDelegationService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(
            ClaimTypes.NameIdentifier) ??
        throw new UnauthorizedAccessException(
            "Kullanıcı bilgisi bulunamadı.");

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<
        ManagerDelegationResponseDto>>
        Create(
            CreateManagerDelegationDto dto)
    {
        try
        {
            var result =
                await _managerDelegationService
                    .CreateAsync(
                        CurrentUserId,
                        User.IsInRole("Admin"),
                        dto);

            return Ok(result);
        }
        catch (
            UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (
            ArgumentException exception)
        {
            return BadRequest(
                new
                {
                    message =
                        exception.Message
                });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<
        List<ManagerDelegationResponseDto>>>
        GetAll()
    {
        var result =
            await _managerDelegationService
                .GetAllAsync();

        return Ok(result);
    }

    [HttpGet("access")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult>
        GetDelegatedManagerAccess()
    {
        var groupIds =
            await _managerDelegationService
                .GetAccessibleGroupIdsAsync(
                    CurrentUserId);

        return Ok(
            new
            {
                hasDelegatedManagerAccess =
                    groupIds.Count > 0,

                groupIds
            });
    }

    [HttpGet("options")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<
        ManagerDelegationOptionsDto>>
        GetOptions()
    {
        var result =
            await _managerDelegationService
                .GetOptionsAsync(
                    CurrentUserId,
                    User.IsInRole("Admin"));

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(
        Roles = "Manager,Employee")]
    public async Task<ActionResult<
        List<ManagerDelegationResponseDto>>>
        GetMyDelegations()
    {
        var result =
            await _managerDelegationService
                .GetMyDelegationsAsync(
                    CurrentUserId);

        return Ok(result);
    }

    [HttpPatch("{id:int}/end")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult>
        End(
            int id)
    {
        try
        {
            var result =
                await _managerDelegationService
                    .EndAsync(
                        id,
                        CurrentUserId,
                        User.IsInRole("Admin"));

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (
            UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (
            ArgumentException exception)
        {
            return BadRequest(
                new
                {
                    message =
                        exception.Message
                });
        }
    }
}
