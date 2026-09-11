using Microsoft.AspNetCore.Identity;
using HukukUyum.API.DTOs.Auth;
using HukukUyum.API.Identity;
using HukukUyum.API.Interfaces;
using HukukUyum.API.Services.Emails;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HukukUyum.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        IEmailSender emailSender)
    {
        _userManager = userManager;
        _configuration = configuration;
        _emailSender = emailSender;
    }

    public async Task<bool> RegisterAsync(
        RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName
        };

        var result =
            await _userManager.CreateAsync(
                user,
                dto.Password);

        if (!result.Succeeded)
        {
            return false;
        }

        var roleResult =
            await _userManager.AddToRoleAsync(
                user,
                "Employee");

        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(
                user);

            return false;
        }

        return true;
    }

    public async Task<LoginResponseDto?> LoginAsync(
        LoginDto dto)
    {
        var user =
            await _userManager.FindByEmailAsync(
                dto.Email);

        if (user == null)
        {
            return null;
        }

        var passwordValid =
            await _userManager.CheckPasswordAsync(
                user,
                dto.Password);

        if (!passwordValid)
        {
            return null;
        }

        var roles =
            await _userManager.GetRolesAsync(
                user);

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id),

            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id),

            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email!),

            new Claim(
                JwtRegisteredClaimNames.Name,
                user.FullName)
        };

        foreach (var role in roles)
        {
            claims.Add(
                new Claim(
                    ClaimTypes.Role,
                    role));
        }

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var token =
            new JwtSecurityToken(
                issuer:
                    _configuration["Jwt:Issuer"],

                audience:
                    _configuration["Jwt:Audience"],

                claims:
                    claims,

                expires:
                    DateTime.UtcNow.AddHours(2),

                signingCredentials:
                    credentials
            );

        return new LoginResponseDto
        {
            Token =
                new JwtSecurityTokenHandler()
                    .WriteToken(token),

            MustChangePassword =
                user.MustChangePassword
        };
    }

    public async Task<bool> ChangePasswordAsync(
        string currentUserId,
        ChangePasswordDto dto)
    {
        var user =
            await _userManager.FindByIdAsync(
                currentUserId);

        if (user is null)
        {
            return false;
        }

        var result =
            await _userManager.ChangePasswordAsync(
                user,
                dto.CurrentPassword,
                dto.NewPassword);

        if (!result.Succeeded)
        {
            return false;
        }

        user.MustChangePassword = false;

        var updateResult =
            await _userManager.UpdateAsync(
                user);

        return updateResult.Succeeded;
    }

    public async Task ForgotPasswordAsync(
        ForgotPasswordDto dto)
    {
        var user =
            await _userManager.FindByEmailAsync(
                dto.Email);

        if (user is null)
        {
            return;
        }

        var token =
            await _userManager
                .GeneratePasswordResetTokenAsync(
                    user);

        var encodedToken =
            Convert.ToBase64String(
                Encoding.UTF8.GetBytes(
                    token));

        var frontendUrl =
            _configuration[
                "Frontend:BaseUrl"];

        if (string.IsNullOrWhiteSpace(
                frontendUrl))
        {
            frontendUrl =
                "http://localhost:5173";
        }

        var resetUrl =
            $"{frontendUrl}/reset-password" +
            $"?email={Uri.EscapeDataString(dto.Email)}" +
            $"&token={Uri.EscapeDataString(encodedToken)}";

        var emailBody = $"""
            <div style="font-family: Arial, sans-serif; line-height:1.6;">
                <h2>Şifre Sıfırlama</h2>

                <p>
                    Merhaba {user.FullName},
                </p>

                <p>
                    Hukuk Uyum hesabınız için
                    şifre sıfırlama talebi alındı.
                </p>

                <p>
                    Yeni şifrenizi belirlemek için
                    aşağıdaki bağlantıya tıklayın:
                </p>

                <p>
                    <a
                        href="{resetUrl}"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#1D4ED8;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Şifremi Sıfırla
                    </a>
                </p>

                <p>
                    Eğer bu işlemi siz talep etmediyseniz
                    bu e-postayı dikkate almayabilirsiniz.
                </p>

                <p>
                    Hukuk Uyum
                </p>
            </div>
            """;

        await _emailSender.SendAsync(
            dto.Email,
            "Hukuk Uyum - Şifre Sıfırlama",
            emailBody);
    }

    public async Task<bool> ResetPasswordAsync(
        ResetPasswordDto dto)
    {
        var user =
            await _userManager.FindByEmailAsync(
                dto.Email);

        if (user is null)
        {
            return false;
        }

        string token;

        try
        {
            var tokenBytes =
                Convert.FromBase64String(
                    dto.Token);

            token =
                Encoding.UTF8.GetString(
                    tokenBytes);
        }
        catch
        {
            return false;
        }

        var result =
            await _userManager
                .ResetPasswordAsync(
                    user,
                    token,
                    dto.NewPassword);

        if (!result.Succeeded)
        {
            return false;
        }

        user.MustChangePassword = false;

        var updateResult =
            await _userManager.UpdateAsync(
                user);

        return updateResult.Succeeded;
    }
    public async Task<ProfileResponseDto?>
    GetProfileAsync(
        string currentUserId)
    {
        var user =
            await _userManager.FindByIdAsync(
                currentUserId);

        if (user is null)
        {
            return null;
        }

        var roles =
            await _userManager.GetRolesAsync(
                user);

        return new ProfileResponseDto
        {
            UserId = user.Id,

            FullName =
                user.FullName,

            Email =
                user.Email ??
                string.Empty,

            Roles =
                roles.ToList()
        };
    }

    public async Task<ProfileResponseDto?>
        UpdateProfileAsync(
            string currentUserId,
            UpdateProfileDto dto)
    {
        var user =
            await _userManager.FindByIdAsync(
                currentUserId);

        if (user is null)
        {
            return null;
        }

        var fullName =
            dto.FullName.Trim();

        if (string.IsNullOrWhiteSpace(
                fullName))
        {
            return null;
        }

        user.FullName =
            fullName;

        var updateResult =
            await _userManager.UpdateAsync(
                user);

        if (!updateResult.Succeeded)
        {
            return null;
        }

        var roles =
            await _userManager.GetRolesAsync(
                user);

        return new ProfileResponseDto
        {
            UserId = user.Id,

            FullName =
                user.FullName,

            Email =
                user.Email ??
                string.Empty,

            Roles =
                roles.ToList()
        };
    }
}