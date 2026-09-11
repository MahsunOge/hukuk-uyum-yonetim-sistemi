using HukukUyum.API.DTOs.Users;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IManagerDelegationService
        _managerDelegationService;

    public UsersController(
        IUserService userService,
        IManagerDelegationService managerDelegationService)
    {
        _userService = userService;
        _managerDelegationService =
            managerDelegationService;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(
            ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? User.FindFirstValue("userId")
        ?? User.FindFirstValue("id");

    private async Task<bool>
        CanReadUsersAsync()
    {
        if (
            User.IsInRole("Admin") ||
            User.IsInRole("Manager")
        )
        {
            return true;
        }

        if (
            !User.IsInRole("Employee") ||
            string.IsNullOrWhiteSpace(
                CurrentUserId)
        )
        {
            return false;
        }

        var accessibleGroupIds =
            await _managerDelegationService
                .GetAccessibleGroupIdsAsync(
                    CurrentUserId);

        return accessibleGroupIds.Count > 0;
    }

    [HttpGet]
    public async Task<
        ActionResult<List<UserResponseDto>>>
        GetAll()
    {
        if (!await CanReadUsersAsync())
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        "Kullanıcı listesini görüntüleme yetkiniz bulunmuyor."
                });
        }

        var users =
            await _userService.GetAllAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<
        ActionResult<UserResponseDto>>
        GetById(
            string id)
    {
        if (!await CanReadUsersAsync())
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        "Kullanıcı bilgilerini görüntüleme yetkiniz bulunmuyor."
                });
        }

        var user =
            await _userService.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message =
                    "Kullanıcı bulunamadı."
            });
        }

        return Ok(user);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<UserResponseDto>>
        Update(
            string id,
            UpdateUserDto updateUserDto)
    {
        try
        {
            var updatedUser =
                await _userService.UpdateAsync(
                    id,
                    updateUserDto);

            if (updatedUser is null)
            {
                return NotFound(new
                {
                    message =
                        "Kullanıcı bulunamadı."
                });
            }

            return Ok(updatedUser);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Delete(
            string id)
    {
        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (currentUserId == id)
        {
            return BadRequest(new
            {
                message =
                    "Kendi kullanıcı hesabınızı silemezsiniz."
            });
        }

        try
        {
            var deleted =
                await _userService.DeleteAsync(
                    id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message =
                        "Kullanıcı bulunamadı."
                });
            }

            return NoContent();
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
}
