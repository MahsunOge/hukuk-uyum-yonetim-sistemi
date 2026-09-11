using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Files;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class FilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ITaskService _taskService;
    private readonly IManagerDelegationService
        _managerDelegationService;

    public FilesController(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        ITaskService taskService,
        IManagerDelegationService managerDelegationService)
    {
        _context = context;
        _environment = environment;
        _taskService = taskService;
        _managerDelegationService =
            managerDelegationService;
    }

    [HttpGet]
    public async Task<
        ActionResult<List<FileManagementResponseDto>>>
        GetAllFiles()
    {
        if (CurrentUserId is null)
        {
            return Unauthorized();
        }

        var query =
            _context.TaskFiles
                .AsNoTracking()
                .Where(file =>
                    !file.TaskItem.IsDeleted);

        if (!User.IsInRole("Admin"))
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        CurrentUserId);

            query = query.Where(file =>
                file.TaskItem.AssignedGroupId
                    .HasValue &&
                accessibleGroupIds.Contains(
                    file.TaskItem
                        .AssignedGroupId.Value));
        }

        var files =
            await query
                .OrderByDescending(file =>
                    file.UploadedAt)
                .Select(file =>
                    new FileManagementResponseDto
                    {
                        Id = file.Id,

                        OriginalFileName =
                            file.OriginalFileName,

                        ContentType =
                            file.ContentType,

                        FileSize =
                            file.FileSize,

                        UploadedAt =
                            file.UploadedAt,

                        TaskItemId =
                            file.TaskItemId,

                        TaskTitle =
                            file.TaskItem.Title
                    })
                .ToListAsync();

        return Ok(files);
    }

    [HttpGet("{fileId:int}/download")]
    public async Task<IActionResult> DownloadFile(
        int fileId)
    {
        if (CurrentUserId is null)
        {
            return Unauthorized();
        }

        var taskFile =
            await _context.TaskFiles
                .AsNoTracking()
                .Include(file =>
                    file.TaskItem)
                .FirstOrDefaultAsync(file =>
                    file.Id == fileId &&
                    !file.TaskItem.IsDeleted);

        if (taskFile is null)
        {
            return NotFound(new
            {
                message =
                    "Dosya bulunamadı."
            });
        }

        var accessibleTask =
            await _taskService.GetByIdAsync(
                taskFile.TaskItemId,
                CurrentUserId,
                User.IsInRole("Admin"));

        if (accessibleTask is null)
        {
            return Forbid();
        }

        if (!TryResolvePhysicalFilePath(
                taskFile.FilePath,
                out var physicalFilePath))
        {
            return BadRequest(new
            {
                message = "Geçersiz dosya yolu."
            });
        }

        if (!System.IO.File.Exists(
                physicalFilePath))
        {
            return NotFound(new
            {
                message =
                    "Dosyanın fiziksel kaydı bulunamadı."
            });
        }

        var fileBytes =
            await System.IO.File
                .ReadAllBytesAsync(
                    physicalFilePath);

        return File(
            fileBytes,
            taskFile.ContentType,
            taskFile.OriginalFileName);
    }

    [HttpDelete("{fileId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFile(
        int fileId)
    {
        var taskFile =
            await _context.TaskFiles
                .FirstOrDefaultAsync(file =>
                    file.Id == fileId);

        if (taskFile is null)
        {
            return NotFound(new
            {
                message =
                    "Dosya bulunamadı."
            });
        }

        if (!TryResolvePhysicalFilePath(
                taskFile.FilePath,
                out var physicalFilePath))
        {
            return BadRequest(new
            {
                message = "Geçersiz dosya yolu."
            });
        }

        if (System.IO.File.Exists(
                physicalFilePath))
        {
            System.IO.File.Delete(

                physicalFilePath);
        }

        _context.TaskFiles.Remove(
            taskFile);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Dosya başarıyla silindi."
        });
    }

    private string? CurrentUserId =>
        User.FindFirstValue(
            ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    private bool TryResolvePhysicalFilePath(
        string relativeFilePath,
        out string physicalFilePath)
    {
        var uploadsRoot = Path.GetFullPath(
            Path.Combine(
                _environment.ContentRootPath,
                "Uploads"));

        physicalFilePath = Path.GetFullPath(
            Path.Combine(
                _environment.ContentRootPath,
                relativeFilePath));

        return physicalFilePath.StartsWith(
            uploadsRoot +
            Path.DirectorySeparatorChar,
            StringComparison.OrdinalIgnoreCase);
    }
}
