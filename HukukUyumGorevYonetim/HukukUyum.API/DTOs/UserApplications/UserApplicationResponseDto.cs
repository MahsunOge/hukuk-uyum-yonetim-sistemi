using HukukUyum.API.Enums;

namespace HukukUyum.API.DTOs.UserApplications;

public class UserApplicationResponseDto
{
    public int Id { get; set; }

    public string FullName { get; set; } =
        string.Empty;

    public string Email { get; set; } =
        string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Department { get; set; }

    public string? PersonnelNumber { get; set; }

    public string? Description { get; set; }

    public UserApplicationStatus Status
    {
        get;
        set;
    }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? ReviewedByUserId
    {
        get;
        set;
    }

    public string? RejectionReason
    {
        get;
        set;
    }
}