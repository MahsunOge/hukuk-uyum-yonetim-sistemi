using HukukUyum.API.DTOs.AuditLogs;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService
        _auditLogService;

    public AuditLogsController(
        IAuditLogService auditLogService)
    {
        _auditLogService =
            auditLogService;
    }

    [HttpGet]
    public async Task<
        ActionResult<List<AuditLogResponseDto>>>
        GetAll(
            [FromQuery] int limit = 300)
    {
        var logs =
            await _auditLogService
                .GetAllAsync(limit);

        return Ok(logs);
    }
}
