using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Groups;

public class UpdateGroupManagerDto
{
    [Required(
        ErrorMessage =
            "Grup yöneticisi seçilmelidir.")]
    public string ManagerUserId { get; set; } =
        string.Empty;
}