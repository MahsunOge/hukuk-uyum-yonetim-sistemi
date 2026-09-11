using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Auth;

public class UpdateProfileDto
{
    [Required(
        ErrorMessage =
            "Ad soyad zorunludur.")]
    [MaxLength(
        150,
        ErrorMessage =
            "Ad soyad en fazla 150 karakter olabilir.")]
    public string FullName { get; set; } =
        string.Empty;
}