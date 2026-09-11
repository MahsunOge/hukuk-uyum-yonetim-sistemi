using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Settings;
using HukukUyum.API.Entities;
using HukukUyum.API.Options;
using HukukUyum.API.Services.Emails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailSettings _emailSettings;
    private readonly IWebHostEnvironment _environment;
    private readonly IEmailSender _emailSender;

    public SettingsController(
        ApplicationDbContext context,
        IOptions<EmailSettings> emailOptions,
        IWebHostEnvironment environment,
        IEmailSender emailSender)
    {
        _context = context;
        _emailSettings = emailOptions.Value;
        _environment = environment;
        _emailSender = emailSender;
    }

    [HttpGet]
    public async Task<
        ActionResult<SystemSettingsResponseDto>>
        GetSettings()
    {
        var settings =
            await GetOrCreateSettingsAsync();

        return Ok(
            new SystemSettingsResponseDto
            {
                EnvironmentName =
                    _environment.EnvironmentName,

                EmailHost =
                    settings.SmtpHost,

                EmailPort =
                    settings.SmtpPort,

                SenderEmail =
                    settings.SenderEmail,

                SenderName =
                    settings.SenderName,

                EmailConfigured =
                    !string.IsNullOrWhiteSpace(
                        settings.SmtpHost) &&
                    !string.IsNullOrWhiteSpace(
                        settings.SenderEmail),

                MaximumFileSizeMb =
                    settings.MaximumFileSizeMb,

                AllowedFileExtensions =
                    BuildAllowedExtensions(
                        settings)
            });
    }

    [HttpPut]
    public async Task<IActionResult>
        UpdateSettings(
            UpdateSystemSettingsDto dto)
    {
        if (
            dto.MaximumFileSizeMb < 1 ||
            dto.MaximumFileSizeMb > 100)
        {
            return BadRequest(new
            {
                message =
                    "Maksimum dosya boyutu 1 ile 100 MB arasında olmalıdır."
            });
        }

        if (
            !dto.AllowPdf &&
            !dto.AllowWord &&
            !dto.AllowExcel)
        {
            return BadRequest(new
            {
                message =
                    "En az bir dosya türüne izin verilmelidir."
            });
        }

        if (
            string.IsNullOrWhiteSpace(
                dto.SmtpHost) ||
            string.IsNullOrWhiteSpace(
                dto.SenderName) ||
            string.IsNullOrWhiteSpace(
                dto.SenderEmail))
        {
            return BadRequest(new
            {
                message =
                    "E-posta ayarları eksik olamaz."
            });
        }

        var settings =
            await GetOrCreateSettingsAsync();

        settings.MaximumFileSizeMb =
            dto.MaximumFileSizeMb;

        settings.AllowPdf =
            dto.AllowPdf;

        settings.AllowWord =
            dto.AllowWord;

        settings.AllowExcel =
            dto.AllowExcel;

        settings.SmtpHost =
            dto.SmtpHost.Trim();

        settings.SmtpPort =
            dto.SmtpPort;

        settings.SenderName =
            dto.SenderName.Trim();

        settings.SenderEmail =
            dto.SenderEmail.Trim();

        settings.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Sistem ayarları başarıyla güncellendi."
        });
    }

    [HttpPost("test-email")]
    public async Task<IActionResult>
        SendTestEmail()
    {
        var currentUserEmail =
            User.FindFirstValue(
                ClaimTypes.Email)
            ?? User.FindFirstValue(
                JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue(
                "email");

        if (string.IsNullOrWhiteSpace(
                currentUserEmail))
        {
            return BadRequest(new
            {
                message =
                    "Oturum açmış Admin kullanıcısının e-posta adresi bulunamadı."
            });
        }

        try
        {
            var body = """
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2>Hukuk Uyum - Test E-postası</h2>

                        <p>
                            E-posta yapılandırmanız başarıyla çalışmaktadır.
                        </p>

                        <p>
                            Bu mesaj sistem ayarları ekranından gönderilmiştir.
                        </p>

                        <p>
                            Hukuk Uyum Sistemi
                        </p>
                    </body>
                </html>
                """;

            await _emailSender.SendAsync(
                currentUserEmail,
                "Hukuk Uyum - E-posta Testi",
                body);

            return Ok(new
            {
                message =
                    $"Test e-postası {currentUserEmail} adresine başarıyla gönderildi."
            });
        }
        catch (Exception exception)
        {
            Console.WriteLine(
                exception);

            return StatusCode(
                StatusCodes
                    .Status500InternalServerError,
                new
                {
                    message =
                        "Test e-postası gönderilemedi. SMTP ayarlarını kontrol ediniz."
                });
        }
    }

    private async Task<SystemSetting>
        GetOrCreateSettingsAsync()
    {
        var settings =
            await _context.SystemSettings
                .FirstOrDefaultAsync();

        if (settings is not null)
        {
            return settings;
        }

        settings =
            new SystemSetting
            {
                MaximumFileSizeMb = 10,
                AllowPdf = true,
                AllowWord = true,
                AllowExcel = true,

                SmtpHost =
                    _emailSettings.Host,

                SmtpPort =
                    _emailSettings.Port,

                SenderName =
                    _emailSettings.SenderName,

                SenderEmail =
                    _emailSettings.SenderEmail,

                UpdatedAt =
                    DateTime.UtcNow
            };

        _context.SystemSettings.Add(
            settings);

        await _context.SaveChangesAsync();

        return settings;
    }

    private static List<string>
        BuildAllowedExtensions(
            SystemSetting settings)
    {
        var extensions =
            new List<string>();

        if (settings.AllowPdf)
        {
            extensions.Add(".pdf");
        }

        if (settings.AllowWord)
        {
            extensions.Add(".doc");
            extensions.Add(".docx");
        }

        if (settings.AllowExcel)
        {
            extensions.Add(".xls");
            extensions.Add(".xlsx");
        }

        return extensions;
    }
}