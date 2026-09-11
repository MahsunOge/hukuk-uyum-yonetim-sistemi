using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Groups;

public class CreateGroupDto
{
    [Required(
        ErrorMessage =
            "Grup adı zorunludur.")]
    [MaxLength(
        100,
        ErrorMessage =
            "Grup adı en fazla 100 karakter olabilir.")]
    public string Name { get; set; } =
        string.Empty;

    [Required(
        ErrorMessage =
            "Grup yöneticisi seçilmelidir.")]
    public string ManagerUserId
    {
        get;
        set;
    } = string.Empty;
}