using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Files;
using HukukUyum.API.Entities;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/tasks/{taskId:int}/files")]
[Authorize]
public class TaskFilesController : ControllerBase
{

    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ITaskService _taskService;

    private static readonly IReadOnlyDictionary<string, HashSet<string>>
        AllowedContentTypes =
            new Dictionary<string, HashSet<string>>(
                StringComparer.OrdinalIgnoreCase)
            {
                [".pdf"] =
                ["application/pdf", "application/octet-stream"],
                [".doc"] =
                ["application/msword", "application/octet-stream"],
                [".docx"] =
                [
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/zip",
                    "application/octet-stream"
                ],
                [".xls"] =
                ["application/vnd.ms-excel", "application/octet-stream"],
                [".xlsx"] =
                [
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/zip",
                    "application/octet-stream"
                ]
            };

    private static readonly IReadOnlyDictionary<string, string>
        CanonicalContentTypes =
            new Dictionary<string, string>(
                StringComparer.OrdinalIgnoreCase)
            {
                [".pdf"] = "application/pdf",
                [".doc"] = "application/msword",
                [".docx"] =
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                [".xls"] = "application/vnd.ms-excel",
                [".xlsx"] =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };

    public TaskFilesController(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        ITaskService taskService)
    {
        _context = context;
        _environment = environment;
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskFileResponseDto>>>
        GetTaskFiles(int taskId)
    {
        var accessFailure =
            await ValidateTaskAccessAsync(taskId);

        if (accessFailure is not null)
        {
            return accessFailure;
        }

        var files = await _context.TaskFiles
            .AsNoTracking()
            .Where(file =>
                file.TaskItemId == taskId)
            .OrderByDescending(file =>
                file.UploadedAt)
            .Select(file =>
                new TaskFileResponseDto
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
                        file.TaskItemId
                })
            .ToListAsync();

        return Ok(files);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
 
    public async Task<ActionResult<TaskFileResponseDto>>
        UploadFile(
            int taskId,
            IFormFile file)
    {
        var accessFailure =
            await ValidateTaskAccessAsync(taskId);

        if (accessFailure is not null)
        {
            return accessFailure;
        }

        if (file is null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Yüklenecek dosya seçilmedi."
            });
        }

        var systemSettings =
     await _context.SystemSettings
         .AsNoTracking()
         .FirstOrDefaultAsync();

        var maximumFileSizeMb =
            systemSettings?.MaximumFileSizeMb ?? 10;

        var maximumFileSizeBytes =
            maximumFileSizeMb *
            1024L *
            1024L;

        if (file.Length > maximumFileSizeBytes)
        {
            return BadRequest(new
            {
                message =
                    $"Dosya boyutu en fazla {maximumFileSizeMb} MB olabilir."
            });
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        var allowedExtensions =
    new List<string>();

        if (systemSettings is null)
        {
            allowedExtensions.AddRange(
            [
                ".pdf",
        ".xls",
        ".xlsx",
        ".doc",
        ".docx"
            ]);
        }
        else
        {
            if (systemSettings.AllowPdf)
            {
                allowedExtensions.Add(
                    ".pdf");
            }

            if (systemSettings.AllowWord)
            {
                allowedExtensions.Add(
                    ".doc");

                allowedExtensions.Add(
                    ".docx");
            }

            if (systemSettings.AllowExcel)
            {
                allowedExtensions.Add(
                    ".xls");

                allowedExtensions.Add(
                    ".xlsx");
            }
        }

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message =
    $"'{extension}' uzantılı dosyaların yüklenmesine izin verilmiyor. Lütfen sistem ayarlarında izin verilen dosya türlerinden birini seçiniz."
            });
        }

        if (!HasAllowedContentType(
                extension,
                file.ContentType) ||
            !await HasValidFileSignatureAsync(
                file,
                extension))
        {
            return BadRequest(new
            {
                message =
                    "Dosyanın içeriği veya MIME türü uzantısıyla uyumlu değil."
            });
        }

        var uploadsFolder = Path.Combine(
            _environment.ContentRootPath,
            "Uploads",
            "Tasks",
            taskId.ToString());

        Directory.CreateDirectory(uploadsFolder);

        var storedFileName =
            $"{Guid.NewGuid():N}{extension}";

        var physicalFilePath = Path.Combine(
            uploadsFolder,
            storedFileName);

        await using (
            var fileStream =
                new FileStream(
                    physicalFilePath,
                    FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        var relativeFilePath = Path.Combine(
            "Uploads",
            "Tasks",
            taskId.ToString(),
            storedFileName);

        var taskFile = new TaskFile
        {
            OriginalFileName =
                Path.GetFileName(file.FileName),

            StoredFileName =
                storedFileName,

            FilePath =
                relativeFilePath,

            ContentType =
                CanonicalContentTypes[extension],

            FileSize =
                file.Length,

            UploadedAt =
                DateTime.UtcNow,

            TaskItemId =
                taskId
        };

        _context.TaskFiles.Add(taskFile);
        await _context.SaveChangesAsync();

        var response = new TaskFileResponseDto
        {
            Id = taskFile.Id,
            OriginalFileName =
                taskFile.OriginalFileName,
            ContentType =
                taskFile.ContentType,
            FileSize =
                taskFile.FileSize,
            UploadedAt =
                taskFile.UploadedAt,
            TaskItemId =
                taskFile.TaskItemId
        };

        return CreatedAtAction(
            nameof(GetTaskFiles),
            new { taskId },
            response);
    }

    [HttpGet("{fileId:int}/download")]
    public async Task<IActionResult> DownloadFile(
        int taskId,
        int fileId)
    {
        var accessFailure =
            await ValidateTaskAccessAsync(taskId);

        if (accessFailure is not null)
        {
            return accessFailure;
        }

        var taskFile =
            await _context.TaskFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(file =>
                    file.Id == fileId &&
                    file.TaskItemId == taskId);

        if (taskFile is null)
        {
            return NotFound(new
            {
                message = "Dosya bulunamadı."
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
        int taskId,
        int fileId)
    {
        var taskFile =
            await _context.TaskFiles
                .FirstOrDefaultAsync(file =>
                    file.Id == fileId &&
                    file.TaskItemId == taskId);

        if (taskFile is null)
        {
            return NotFound(new
            {
                message = "Dosya bulunamadı."
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

        _context.TaskFiles.Remove(taskFile);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Dosya başarıyla silindi."
        });
    }

    private string? CurrentUserId =>
        User.FindFirstValue(
            ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    private async Task<ActionResult?>
        ValidateTaskAccessAsync(int taskId)
    {
        if (CurrentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var taskExists =
            await _context.Tasks
                .AsNoTracking()
                .AnyAsync(task =>
                    task.Id == taskId &&
                    !task.IsDeleted);

        if (!taskExists)
        {
            return NotFound(new
            {
                message = "Görev bulunamadı."
            });
        }

        var accessibleTask =
            await _taskService.GetByIdAsync(
                taskId,
                CurrentUserId,
                User.IsInRole("Admin"));

        return accessibleTask is null
            ? Forbid()
            : null;
    }

    private static bool HasAllowedContentType(
        string extension,
        string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType))
        {
            return true;
        }

        var normalizedContentType =
            contentType.Split(';', 2)[0].Trim();

        return AllowedContentTypes.TryGetValue(
                   extension,
                   out var allowedTypes) &&
               allowedTypes.Contains(
                   normalizedContentType);
    }

    private static async Task<bool>
        HasValidFileSignatureAsync(
            IFormFile file,
            string extension)
    {
        var header = new byte[8];

        await using var stream =
            file.OpenReadStream();

        var bytesRead =
            await stream.ReadAsync(
                header.AsMemory(
                    0,
                    header.Length));

        if (bytesRead < 4)
        {
            return false;
        }

        var isPdf =
            bytesRead >= 5 &&
            header[0] == 0x25 &&
            header[1] == 0x50 &&
            header[2] == 0x44 &&
            header[3] == 0x46 &&
            header[4] == 0x2D;

        var isZip =
            header[0] == 0x50 &&
            header[1] == 0x4B &&
            (
                header[2] == 0x03 &&
                header[3] == 0x04 ||
                header[2] == 0x05 &&
                header[3] == 0x06 ||
                header[2] == 0x07 &&
                header[3] == 0x08
            );

        var isOleCompoundFile =
            bytesRead == 8 &&
            header.SequenceEqual(
            new byte[]
            {
                0xD0,
                0xCF,
                0x11,
                0xE0,
                0xA1,
                0xB1,
                0x1A,
                0xE1
            });

        return extension switch
        {
            ".pdf" => isPdf,
            ".docx" or ".xlsx" => isZip,
            ".doc" or ".xls" =>
                isOleCompoundFile,
            _ => false
        };
    }

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
