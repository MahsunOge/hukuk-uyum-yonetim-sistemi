using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(150, ErrorMessage = "Ad soyad en fazla 150 karakter olabilir.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;
}