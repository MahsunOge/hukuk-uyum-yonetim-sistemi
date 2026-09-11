using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.UserApplications;

public class ApproveUserApplicationDto
{
    [Required(
        ErrorMessage =
            "Kullanıcı rolü zorunludur.")]
    public string Role { get; set; } =
        "Employee";

    public int? GroupId { get; set; }
}