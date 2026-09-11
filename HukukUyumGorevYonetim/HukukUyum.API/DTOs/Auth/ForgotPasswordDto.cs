using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Auth;

public class ForgotPasswordDto
{
    [Required(
        ErrorMessage =
            "E-posta adresi zorunludur.")]
    [EmailAddress(
        ErrorMessage =
            "Geçerli bir e-posta adresi giriniz.")]
    public string Email { get; set; } =
        string.Empty;
}