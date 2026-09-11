using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Auth;

public class ResetPasswordDto
{
    [Required(
        ErrorMessage =
            "E-posta adresi zorunludur.")]
    [EmailAddress]
    public string Email { get; set; } =
        string.Empty;

    [Required(
        ErrorMessage =
            "Şifre sıfırlama kodu zorunludur.")]
    public string Token { get; set; } =
        string.Empty;

    [Required(
        ErrorMessage =
            "Yeni şifre zorunludur.")]
    [MinLength(
        6,
        ErrorMessage =
            "Yeni şifre en az 6 karakter olmalıdır.")]
    public string NewPassword { get; set; } =
        string.Empty;

    [Required(
        ErrorMessage =
            "Yeni şifre tekrarı zorunludur.")]
    [Compare(
        nameof(NewPassword),
        ErrorMessage =
            "Yeni şifreler eşleşmiyor.")]
    public string ConfirmNewPassword { get; set; } =
        string.Empty;
}