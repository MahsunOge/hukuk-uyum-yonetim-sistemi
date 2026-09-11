using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Leaves;

public class CancelLeaveRequestDto
{
    [Required(ErrorMessage = "İptal gerekçesi zorunludur.")]
    [StringLength(500, MinimumLength = 3, ErrorMessage = "Gerekçe 3–500 karakter olmalıdır.")]
    public string Reason { get; set; } = string.Empty;
}
