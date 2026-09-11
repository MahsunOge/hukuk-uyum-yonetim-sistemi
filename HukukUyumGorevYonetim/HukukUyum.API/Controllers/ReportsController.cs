using HukukUyum.API.DTOs.Reports;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class ReportsController : ControllerBase
{
    private readonly IReportService
        _reportService;

    public ReportsController(
        IReportService reportService)
    {
        _reportService =
            reportService;
    }

    [HttpGet("summary")]
    public async Task<
        ActionResult<ReportSummaryDto>>
        GetSummary()
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

        var canViewAllReports =
            User.IsInRole("Admin");

        var report =
            await _reportService
                .GetSummaryAsync(
                    currentUserId,
                    canViewAllReports);

        return Ok(report);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel([FromQuery] int? groupId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        GroupReportDto? group = null;
        ReportSummaryDto summary;
        if (groupId.HasValue)
        {
            if (!User.IsInRole("Admin")) return Forbid();
            group = (await _reportService.GetGroupReportsAsync()).FirstOrDefault(g => g.GroupId == groupId.Value);
            if (group is null) return NotFound();
            summary = group.Summary;
        }
        else summary = await _reportService.GetSummaryAsync(userId, User.IsInRole("Admin"));
        return File(Services.ReportWorkbook.Create(group?.GroupName ?? "Görev Raporu", summary, group),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"gorev-raporu-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("groups")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<GroupReportDto>>> GetGroupReports()
    {
        return Ok(await _reportService.GetGroupReportsAsync());
    }
}
