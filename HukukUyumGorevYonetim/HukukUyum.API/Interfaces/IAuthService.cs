using HukukUyum.API.DTOs.Auth;

namespace HukukUyum.API.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(
        RegisterDto dto);

    Task<LoginResponseDto?> LoginAsync(
        LoginDto dto);

    Task<bool> ChangePasswordAsync(
        string currentUserId,
        ChangePasswordDto dto);

    Task ForgotPasswordAsync(
        ForgotPasswordDto dto);

    Task<bool> ResetPasswordAsync(
        ResetPasswordDto dto);

    Task<ProfileResponseDto?>
        GetProfileAsync(
            string currentUserId);

    Task<ProfileResponseDto?>
        UpdateProfileAsync(
            string currentUserId,
            UpdateProfileDto dto);
}