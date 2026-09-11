using HukukUyum.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Tasks;

public class CreateUserRequestDto
{
    [Required(
        ErrorMessage =
            "Talep başlığı zorunludur.")]
    [MaxLength(
        200,
        ErrorMessage =
            "Talep başlığı en fazla 200 karakter olabilir.")]
    public string Title { get; set; } =
        string.Empty;

    [MaxLength(
        2000,
        ErrorMessage =
            "Açıklama en fazla 2000 karakter olabilir.")]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } =
        TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    [Required(
        ErrorMessage =
            "Kategori seçimi zorunludur.")]
    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "Geçerli bir kategori seçilmelidir.")]
    public int CategoryId { get; set; }
}