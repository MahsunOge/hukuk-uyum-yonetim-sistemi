using System.Net;
using System.Security.Cryptography;
using HukukUyum.API.Data;
using HukukUyum.API.DTOs.UserApplications;
using HukukUyum.API.Entities;
using HukukUyum.API.Enums;
using HukukUyum.API.Identity;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class UserApplicationService
    : IUserApplicationService
{
    private readonly ApplicationDbContext _context;

    private readonly UserManager<ApplicationUser>
        _userManager;

    public UserApplicationService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<UserApplicationResponseDto>
        CreateAsync(
            CreateUserApplicationDto dto)
    {
        var normalizedEmail =
            dto.Email.Trim().ToLowerInvariant();

        var existingUser =
            await _userManager.FindByEmailAsync(
                normalizedEmail);

        if (existingUser is not null)
        {
            throw new ArgumentException(
                "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunmaktadır.");
        }

        var pendingApplicationExists =
            await _context.UserApplications
                .AsNoTracking()
                .AnyAsync(application =>
                    application.Email ==
                        normalizedEmail &&
                    application.Status ==
                        UserApplicationStatus.Pending);

        if (pendingApplicationExists)
        {
            throw new ArgumentException(
                "Bu e-posta adresine ait bekleyen bir başvuru bulunmaktadır.");
        }

        var application =
            new UserApplication
            {
                FullName =
                    dto.FullName.Trim(),

                Email = normalizedEmail,

                PhoneNumber =
                    NormalizeOptionalText(
                        dto.PhoneNumber),

                Department =
                    NormalizeOptionalText(
                        dto.Department),

                PersonnelNumber =
                    NormalizeOptionalText(
                        dto.PersonnelNumber),

                Description =
                    NormalizeOptionalText(
                        dto.Description),

                Status =
                    UserApplicationStatus.Pending,

                CreatedAt = DateTime.UtcNow
            };

        _context.UserApplications.Add(
            application);

        await _context.SaveChangesAsync();

        return MapToResponseDto(
            application);
    }

    public async Task<
        List<UserApplicationResponseDto>>
        GetAllAsync()
    {
        var applications =
            await _context.UserApplications
                .AsNoTracking()
                .OrderByDescending(application =>
                    application.CreatedAt)
                .ToListAsync();

        return applications
            .Select(MapToResponseDto)
            .ToList();
    }

    public async Task<UserApplicationResponseDto?>
        GetByIdAsync(int id)
    {
        var application =
            await _context.UserApplications
                .AsNoTracking()
                .FirstOrDefaultAsync(application =>
                    application.Id == id);

        return application is null
            ? null
            : MapToResponseDto(application);
    }

    public async Task<UserApplicationResponseDto?>
        ApproveAsync(
            int id,
            ApproveUserApplicationDto dto,
            string reviewedByUserId)
    {
        var application =
            await _context.UserApplications
                .FirstOrDefaultAsync(application =>
                    application.Id == id);

        if (application is null)
        {
            return null;
        }

        if (application.Status !=
            UserApplicationStatus.Pending)
        {
            throw new ArgumentException(
                "Yalnızca bekleyen başvurular onaylanabilir.");
        }

        var role = dto.Role.Trim();

        var allowedRoles = new[]
        {
            "Admin",
            "Manager",
            "Employee"
        };

        if (!allowedRoles.Contains(
                role,
                StringComparer.OrdinalIgnoreCase))
        {
            throw new ArgumentException(
                "Geçersiz kullanıcı rolü seçildi.");
        }

        role = allowedRoles.First(
            allowedRole =>
                allowedRole.Equals(
                    role,
                    StringComparison.OrdinalIgnoreCase));

        if (dto.GroupId.HasValue)
        {
            var groupExists =
                await _context.Groups
                    .AsNoTracking()
                    .AnyAsync(group =>
                        group.Id ==
                            dto.GroupId.Value);

            if (!groupExists)
            {
                throw new ArgumentException(
                    "Seçilen grup bulunamadı.");
            }
        }

        var existingUser =
            await _userManager.FindByEmailAsync(
                application.Email);

        if (existingUser is not null)
        {
            throw new ArgumentException(
                "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunmaktadır.");
        }

        var temporaryPassword =
            GenerateTemporaryPassword();

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            var user = new ApplicationUser
            {
                UserName = application.Email,
                Email = application.Email,
                EmailConfirmed = true,
                FullName = application.FullName,
                PhoneNumber =
                    application.PhoneNumber,
                MustChangePassword = true
            };

            var createResult =
                await _userManager.CreateAsync(
                    user,
                    temporaryPassword);

            if (!createResult.Succeeded)
            {
                var errorMessage = string.Join(
                    " ",
                    createResult.Errors.Select(
                        error =>
                            error.Description));

                throw new ArgumentException(
                    $"Kullanıcı hesabı oluşturulamadı: {errorMessage}");
            }

            var roleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    role);

            if (!roleResult.Succeeded)
            {
                var errorMessage = string.Join(
                    " ",
                    roleResult.Errors.Select(
                        error =>
                            error.Description));

                throw new ArgumentException(
                    $"Kullanıcı rolü atanamadı: {errorMessage}");
            }

            if (dto.GroupId.HasValue)
            {
                _context.UserGroups.Add(
                    new UserGroup
                    {
                        UserId = user.Id,
                        GroupId =
                            dto.GroupId.Value
                    });
            }

            application.Status =
                UserApplicationStatus.Approved;

            application.ReviewedAt =
                DateTime.UtcNow;

            application.ReviewedByUserId =
                reviewedByUserId;

            application.RejectionReason = null;

            _context.EmailOutbox.Add(
                CreateTemporaryPasswordEmail(
                    application,
                    temporaryPassword,
                    role));

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToResponseDto(
                application);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<UserApplicationResponseDto?>
        RejectAsync(
            int id,
            RejectUserApplicationDto dto,
            string reviewedByUserId)
    {
        var application =
            await _context.UserApplications
                .FirstOrDefaultAsync(application =>
                    application.Id == id);

        if (application is null)
        {
            return null;
        }

        if (application.Status !=
            UserApplicationStatus.Pending)
        {
            throw new ArgumentException(
                "Yalnızca bekleyen başvurular reddedilebilir.");
        }

        application.Status =
            UserApplicationStatus.Rejected;

        application.ReviewedAt =
            DateTime.UtcNow;

        application.ReviewedByUserId =
            reviewedByUserId;

        application.RejectionReason =
            dto.RejectionReason.Trim();

        await _context.SaveChangesAsync();

        return MapToResponseDto(
            application);
    }

    private static string GenerateTemporaryPassword()
    {
        const string characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ" +
            "abcdefghijkmnopqrstuvwxyz" +
            "23456789";

        var randomCharacters =
            new char[8];

        for (
            var index = 0;
            index < randomCharacters.Length;
            index++)
        {
            randomCharacters[index] =
                characters[
                    RandomNumberGenerator.GetInt32(
                        characters.Length)];
        }

        return
            $"Aa1!{new string(randomCharacters)}";
    }

    private static EmailOutbox
        CreateTemporaryPasswordEmail(
            UserApplication application,
            string temporaryPassword,
            string role)
    {
        var safeFullName =
            WebUtility.HtmlEncode(
                application.FullName);

        var safeEmail =
            WebUtility.HtmlEncode(
                application.Email);

        var safePassword =
            WebUtility.HtmlEncode(
                temporaryPassword);

        var safeRole =
            WebUtility.HtmlEncode(role);

        var body = $"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Kullanıcı Başvurunuz Onaylandı</h2>

                <p>Merhaba {safeFullName},</p>

                <p>
                    Hukuk Uyum sistemi kullanıcı
                    başvurunuz onaylanmıştır.
                </p>

                <table style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            E-posta:
                        </td>
                        <td style="padding: 6px;">
                            {safeEmail}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Geçici şifre:
                        </td>
                        <td style="padding: 6px;">
                            {safePassword}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Rol:
                        </td>
                        <td style="padding: 6px;">
                            {safeRole}
                        </td>
                    </tr>
                </table>

                <p>
                    Sisteme ilk girişinizden sonra
                    geçici şifrenizi değiştirmeniz
                    gerekmektedir.
                </p>

                <p>Hukuk Uyum Sistemi</p>
            </body>
            </html>
            """;

        return new EmailOutbox
        {
            ToEmail = application.Email,
            Subject =
                "Hukuk Uyum kullanıcı başvurunuz onaylandı",
            Body = body,
            Status = EmailStatus.Pending,
            RetryCount = 0,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static string? NormalizeOptionalText(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static UserApplicationResponseDto
        MapToResponseDto(
            UserApplication application)
    {
        return new UserApplicationResponseDto
        {
            Id = application.Id,
            FullName = application.FullName,
            Email = application.Email,
            PhoneNumber =
                application.PhoneNumber,
            Department =
                application.Department,
            PersonnelNumber =
                application.PersonnelNumber,
            Description =
                application.Description,
            Status = application.Status,
            CreatedAt =
                application.CreatedAt,
            ReviewedAt =
                application.ReviewedAt,
            ReviewedByUserId =
                application.ReviewedByUserId,
            RejectionReason =
                application.RejectionReason
        };
    }
}