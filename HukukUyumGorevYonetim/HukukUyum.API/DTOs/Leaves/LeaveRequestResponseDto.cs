using HukukUyum.API.Enums;

namespace HukukUyum.API.DTOs.Leaves;

public class LeaveRequestResponseDto
{
    public string? CancellationDescription { get; set; }
    public int Id { get; set; }

    public string UserId { get; set; } =
        string.Empty;

    public string UserFullName { get; set; } =
        string.Empty;

    public int? GroupId { get; set; }

    public string? GroupName { get; set; }

    public LeaveType LeaveType { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? Description { get; set; }

    public LeaveStatus Status { get; set; }

    public string? ReviewedByUserId { get; set; }

    public string? ReviewedByUserFullName { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }
}
