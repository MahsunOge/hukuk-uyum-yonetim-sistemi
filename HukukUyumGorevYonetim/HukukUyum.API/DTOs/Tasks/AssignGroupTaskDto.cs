using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Tasks;

public class AssignGroupTaskDto
{
    [Required(
        ErrorMessage =
            "Atanacak kullanıcı seçilmelidir.")]
    public string UserId { get; set; } =
        string.Empty;
}