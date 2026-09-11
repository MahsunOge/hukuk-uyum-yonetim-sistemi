using Microsoft.AspNetCore.Mvc;
using HukukUyum.API.DTOs.Auth;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(
        IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult>
        GetProfile()
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var profile =
            await _authService
                .GetProfileAsync(
                    currentUserId);

        if (profile is null)
        {
            return NotFound(new
            {
                message =
                    "Kullanıcı profili bulunamadı."
            });
        }

        return Ok(profile);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult>
        UpdateProfile(
            UpdateProfileDto dto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var profile =
            await _authService
                .UpdateProfileAsync(
                    currentUserId,
                    dto);

        if (profile is null)
        {
            return BadRequest(new
            {
                message =
                    "Profil bilgileri güncellenemedi."
            });
        }

        return Ok(new
        {
            message =
                "Profil bilgileri başarıyla güncellendi.",

            profile
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult>
        ChangePassword(
            ChangePasswordDto dto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var result =
            await _authService
                .ChangePasswordAsync(
                    currentUserId,
                    dto);

        if (!result)
        {
            return BadRequest(new
            {
                message =
                    "Şifre değiştirilemedi. Mevcut şifrenizi kontrol ediniz."
            });
        }

        return Ok(new
        {
            message =
                "Şifreniz başarıyla değiştirildi."
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult>
        ForgotPassword(
            ForgotPasswordDto dto)
    {
        await _authService
            .ForgotPasswordAsync(
                dto);

        return Ok(new
        {
            message =
                "Eğer bu e-posta adresine ait bir kullanıcı varsa, şifre sıfırlama bağlantısı gönderilmiştir."
        });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult>
        ResetPassword(
            ResetPasswordDto dto)
    {
        var result =
            await _authService
                .ResetPasswordAsync(
                    dto);

        if (!result)
        {
            return BadRequest(new
            {
                message =
                    "Şifre sıfırlama işlemi başarısız oldu. Bağlantı geçersiz veya süresi dolmuş olabilir."
            });
        }

        return Ok(new
        {
            message =
                "Şifreniz başarıyla sıfırlandı."
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult>
        Register(
            RegisterDto dto)
    {
        var result =
            await _authService
                .RegisterAsync(
                    dto);

        if (!result)
        {
            return BadRequest(
                "Kullanıcı oluşturulamadı."
            );
        }

        return Ok(
            "Kullanıcı başarıyla oluşturuldu."
        );
    }

    [HttpPost("login")]
    public async Task<IActionResult>
        Login(
            LoginDto dto)
    {
        var result =
            await _authService
                .LoginAsync(
                    dto);

        if (result == null)
        {
            return BadRequest(
                "Email veya şifre hatalı."
            );
        }

        return Ok(result);
    }

    private string?
        GetCurrentUserId()
    {
        return User.FindFirstValue(
                   ClaimTypes.NameIdentifier)
               ??
               User.FindFirstValue(
                   "sub")
               ??
               User.FindFirstValue(
                   "userId")
               ??
               User.FindFirstValue(
                   "id");
    }
}