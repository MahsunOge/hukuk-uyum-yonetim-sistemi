using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Auth;

public class ChangePasswordDto
{
    [Required(
        ErrorMessage =
            "Mevcut şifre zorunludur.")]
    public string CurrentPassword
    {
        get;
        set;
    } = string.Empty;

    [Required(
        ErrorMessage =
            "Yeni şifre zorunludur.")]
    [MinLength(
        6,
        ErrorMessage =
            "Yeni şifre en az 6 karakter olmalıdır.")]
    public string NewPassword
    {
        get;
        set;
    } = string.Empty;

    [Required(
        ErrorMessage =
            "Yeni şifre tekrarı zorunludur.")]
    [Compare(
        nameof(NewPassword),
        ErrorMessage =
            "Yeni şifreler eşleşmiyor.")]
    public string ConfirmNewPassword
    {
        get;
        set;
    } = string.Empty;
}