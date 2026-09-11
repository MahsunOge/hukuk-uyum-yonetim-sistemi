using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.UserApplications;

public class RejectUserApplicationDto
{
    [Required(
        ErrorMessage =
            "Red nedeni zorunludur.")]
    [MaxLength(1000)]
    public string RejectionReason
    {
        get;
        set;
    } = string.Empty;
}