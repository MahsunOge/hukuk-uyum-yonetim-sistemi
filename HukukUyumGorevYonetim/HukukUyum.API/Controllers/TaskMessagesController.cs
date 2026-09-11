using HukukUyum.API.DTOs.TaskMessages;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/tasks/{taskId:int}/messages")]
[Authorize]
public class TaskMessagesController : ControllerBase
{
    private readonly ITaskMessageService _messageService;

    public TaskMessagesController(
        ITaskMessageService messageService)
    {
        _messageService = messageService;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(int taskId)
    {
        if (CurrentUserId is null) return Unauthorized();
        try { return Ok(new { count = await _messageService.GetUnreadCountAsync(taskId, CurrentUserId, User.IsInRole("Admin")) }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPatch("read/{throughMessageId:int}")]
    public async Task<IActionResult> MarkRead(int taskId, int throughMessageId)
    {
        if (CurrentUserId is null) return Unauthorized();
        try
        {
            await _messageService.MarkReadAsync(taskId, throughMessageId, CurrentUserId, User.IsInRole("Admin"));
            return NoContent();
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskMessageResponseDto>>> GetMessages(
        int taskId)
    {
        if (CurrentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var messages = await _messageService.GetMessagesAsync(
                taskId,
                CurrentUserId,
                User.IsInRole("Admin"));

            return Ok(messages);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskMessageResponseDto>> CreateMessage(
        int taskId,
        CreateTaskMessageDto dto)
    {
        if (CurrentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var message = await _messageService.CreateMessageAsync(
                taskId,
                dto,
                CurrentUserId,
                User.IsInRole("Admin"));

            return Ok(message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }
}
