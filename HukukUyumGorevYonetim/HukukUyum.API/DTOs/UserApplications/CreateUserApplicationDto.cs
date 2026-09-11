using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.UserApplications;

public class CreateUserApplicationDto
{
    [Required(
        ErrorMessage =
            "Ad soyad bilgisi zorunludur.")]
    [MaxLength(150)]
    public string FullName { get; set; } =
        string.Empty;

    [Required(
        ErrorMessage =
            "E-posta adresi zorunludur.")]
    [EmailAddress(
        ErrorMessage =
            "Geçerli bir e-posta adresi girilmelidir.")]
    [MaxLength(200)]
    public string Email { get; set; } =
        string.Empty;

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(50)]
    public string? PersonnelNumber { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}