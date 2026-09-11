using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Groups;

public class AddUserToGroupDto
{
    [Required(ErrorMessage = "Kullanıcı ID alanı zorunludur.")]
    public string UserId { get; set; } = string.Empty;
}