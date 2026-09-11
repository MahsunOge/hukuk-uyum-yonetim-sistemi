using System.Security.Claims;
using HukukUyum.API.DTOs.UserApplications;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserApplicationsController
    : ControllerBase
{
    private readonly IUserApplicationService
        _userApplicationService;

    public UserApplicationsController(
        IUserApplicationService
            userApplicationService)
    {
        _userApplicationService =
            userApplicationService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<
        ActionResult<UserApplicationResponseDto>>
        Create(
            CreateUserApplicationDto dto)
    {
        try
        {
            var createdApplication =
                await _userApplicationService
                    .CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id =
                        createdApplication.Id
                },
                createdApplication);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<
            List<UserApplicationResponseDto>>>
        GetAll()
    {
        var applications =
            await _userApplicationService
                .GetAllAsync();

        return Ok(applications);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<UserApplicationResponseDto>>
        GetById(int id)
    {
        var application =
            await _userApplicationService
                .GetByIdAsync(id);

        if (application is null)
        {
            return NotFound(new
            {
                message =
                    "Kullanıcı başvurusu bulunamadı."
            });
        }

        return Ok(application);
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<UserApplicationResponseDto>>
        Approve(
            int id,
            ApproveUserApplicationDto dto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var approvedApplication =
                await _userApplicationService
                    .ApproveAsync(
                        id,
                        dto,
                        currentUserId);

            if (approvedApplication is null)
            {
                return NotFound(new
                {
                    message =
                        "Onaylanacak kullanıcı başvurusu bulunamadı."
                });
            }

            return Ok(
                approvedApplication);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<UserApplicationResponseDto>>
        Reject(
            int id,
            RejectUserApplicationDto dto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var rejectedApplication =
                await _userApplicationService
                    .RejectAsync(
                        id,
                        dto,
                        currentUserId);

            if (rejectedApplication is null)
            {
                return NotFound(new
                {
                    message =
                        "Reddedilecek kullanıcı başvurusu bulunamadı."
                });
            }

            return Ok(
                rejectedApplication);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(
                   ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")
               ?? User.FindFirstValue("userId")
               ?? User.FindFirstValue("id");
    }
}