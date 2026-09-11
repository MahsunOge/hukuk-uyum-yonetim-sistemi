using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    [MinLength(1, ErrorMessage = "Kullanıcıya en az bir rol atanmalıdır.")]
    public List<string> Roles { get; set; } = new();

    public List<int> GroupIds { get; set; } = new();
}
